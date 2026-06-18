import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { getUserByIdEmail } from "../dao/user.dao";
import { SessionUserType } from "../types";
import { CacheKeys } from "../lib/cacheKeys";
import { getOrSetCache, TTL } from "../lib/cache";
import { isRedisReady, redisClient } from "../lib/redis";
import { checkPermissionDAO } from "../dao/permission.dao";

type CachedAuthUser = {
    id: number;
    username: string;
    role: string;
    access: string;
    company: number;
    email: string;
    flat: string;
};

export const detectPlatform = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const hostname = req.hostname;
        const platformHeader = req.headers["x-platform-id"];

        // Priority 0: Public Route Bypass
        const publicPaths = ["/sitemap.xml", "/api/seo", "/api/open", "/health", "/api/health/db"];
        if (publicPaths.some(path => req.originalUrl.startsWith(path))) {
            req.clientId = "PUBLIC_API";
            next();
            return;
        }

        // Priority 1: Explicit header (standard for dev/cross-domain testing)
        if (platformHeader) {
            if (platformHeader === "admin") {
                req.clientId = "ADMIN_APP";
                next();
                return;
            }
            if (platformHeader === "member") {
                req.clientId = "MEMBER_APP";
                next();
                return;
            }
        }

        // Priority 2: Hostname-based detection (Standard for Prod)
        const platformMap: Record<string, string> = {
            "hrms.valueye.in": "ADMIN_APP",
            "hrms-front.valueye.in": "MEMBER_APP",
        };

        let clientId = platformMap[hostname];

        // Fallback for cross-origin API calls where the backend is on a different domain/IP
        if (!clientId && req.headers.origin) {
            try {
                const originUrl = new URL(req.headers.origin);
                clientId = platformMap[originUrl.hostname];
            } catch (e) {
                // Ignore parsing errors
            }
        }

        if (!clientId && req.headers.referer) {
            try {
                const refererUrl = new URL(req.headers.referer);
                clientId = platformMap[refererUrl.hostname];
            } catch (e) {
                // Ignore parsing errors
            }
        }

        if (clientId) {
            req.clientId = clientId;
            next();
            return;
        }

        // Priority 3: Mobile (Capacitor) & Development Localhost Fallback
        const isLocalHost = ["localhost", "127.0.0.1"].includes(hostname);
        const isCapacitor = req.headers.origin?.startsWith("capacitor://") ||
            req.headers.origin?.startsWith("http://localhost") ||
            req.headers.referer?.startsWith("capacitor://");

        if (isLocalHost || isCapacitor) {
            // If the x-platform-id header was missing, we default to a safe value.
            // For production mobile apps, we default to MEMBER_APP as it's the most common entry point.
            // For general development, we use DEVELOPER_APP.
            req.clientId = (process.env.NODE_ENV === "production") ? "MEMBER_APP" : "DEVELOPER_APP";
            next();
            return;
        }

        res.status(403).json({
            type: "error",
            message: "Unknown platform or unauthorized host",
        });
        return;
    } catch (err) {
        next(err);
    }
};

export const validatePlatformAccess = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({ type: "error", message: "Unauthorized" });
        return;
    }

    // Skip strict check for DEVELOPER_APP or local development in general
    if (process.env.NODE_ENV !== "production") {
        next();
        return;
    }

    // Production: user's clientId must match current platform
    if (req.user.clientId !== req.clientId) {
        res.status(403).json({
            type: "error",
            message: "Token not valid for this platform",
        });
        return;
    }

    next();
};

export const verifyToken = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // get token from header
        const authHeader = request.headers.authorization as string;

        // check if token is present
        if (!authHeader?.startsWith("Bearer ")) {
            console.log("Error: Due to Authorization token is missing");
            response.status(401).json({
                type: "error",
                message: "Authorization token is missing",
            });
            return;
        }

        // extract token from header
        const token = authHeader.split(" ")[1];

        // verify token with audience check (relaxed for development)
        const verifyOptions: jwt.VerifyOptions = {};
        if (process.env.NODE_ENV === "production") {
            verifyOptions.audience = request.clientId; // Standard JWT audience validation in PROD
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string,
            verifyOptions
        ) as SessionUserType;

        const { company } = request.query;
        const cacheKey = CacheKeys.company.auth.user(Number(company), decoded.id, decoded.email);

        // 🔥 Get or Set Cache
        const user = await getOrSetCache<CachedAuthUser | null>(
            cacheKey,
            TTL.AUTH,
            async () => {
                const dbUser = await getUserByIdEmail(decoded.id, decoded.email);
                if (!dbUser) return null;

                return {
                    id: dbUser.el_id,
                    username: dbUser.el_username,
                    role: dbUser.el_role,
                    access: 'AD',
                    company: 0,
                    email: '',
                    flat: ''
                };
            }
        );

        if (!user) {
            console.log("Error: Due to User does not match any record");
            response.status(401).json({
                type: "error",
                message: "User does not match any record",
            });
            return;
        }

        // 🛡️ Security Check: Ensure role hasn't changed since token issuance
        if (user.role !== decoded.role) {
            console.log("Error: Due to Falsified role in request");
            response.status(403).json({
                type: "error",
                message: "Falsified role in request",
            });
            return;
        }

        // 🔐 Attach trusted data to request.user (using extension from express.d.ts if available)
        // For now using body as per existing pattern but ideally we use req.user
        request.user = {
            ...decoded,
            ...user,
            clientId: decoded.clientId
        } as SessionUserType;

        // Also maintaining existing request.body pattern for compatibility if needed
        request.body = {
            ...request.body,
            username: user.username,
            role: user.role,
            access: user.access,
            company: user.company,
            userId: user.id,
            flat: user.flat,
        };

        // 🛡️ Redis-based rate limiting per user (100 requests per 60 seconds)
        if (isRedisReady()) {
            const limitKey = `company:${user.company}:rate:user:${user.id}`;
            const limit = 100;
            const windowSeconds = 60;

            const current = await redisClient.incr(limitKey);

            if (current === 1) {
                await redisClient.expire(limitKey, windowSeconds);
            }

            if (current > limit) {
                response.status(429).json({
                    type: "error",
                    message: "Too many requests. Please try again after a minute.",
                    retryAfter: windowSeconds
                });
                return;
            }
        }

        // Strict platform check: user's clientId must match current platform
        validatePlatformAccess(request, response, next);
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            console.log("Error: Due to TokenExpiredError : Token Expired");
            response.status(401).json({
                type: "error",
                message: "token_expired",
            });
            return;
        }

        if (error instanceof JsonWebTokenError) {
            console.log(error);
            console.log("Error: Due to JsonWebTokenError");
            response.status(401).json({
                type: "error",
                message: error.message === "jwt audience invalid"
                    ? "Token not valid for this platform"
                    : error.message,
            });
            return;
        }

        console.log("Error: Due to Internal server error");
        response.status(500).json({
            type: "error",
            message: "Internal server error",
        });
    }
};

export async function checkUserPermission(user: SessionUserType, permission: string | string[]): Promise<boolean> {
    const companyId = user.company;
    const userId = user.id;
    const roleId = Number(user.role);

    const permissions = Array.isArray(permission) ? permission : [permission];

    for (const p of permissions) {
        const cacheKey = CacheKeys.company.permissions.check(companyId, userId, p);

        // 🔥 Get or Set Cache
        const hasPermission = await getOrSetCache<boolean>(
            cacheKey,
            TTL.AUTH,
            async () => {
                const result = await checkPermissionDAO(roleId, p);
                return result;
            }
        );

        if (hasPermission) return true;
    }

    return false;
}

export function requirePermission(permission: string | string[]) {
    return async (request: Request, response: Response, next: NextFunction) => {
        try {
            const user = request.user;
            if (!user) {
                response.status(401).json({ type: "error", message: "Unauthorized" });
                return;
            }

            const hasPermission = await checkUserPermission(user, permission);

            if (hasPermission) {
                next();
            } else {
                const permissions = Array.isArray(permission) ? permission : [permission];
                response.status(403).json({
                    type: "error",
                    message: `Forbidden: Missing required permission [${permissions.join(" or ")}]`
                });
            }
        } catch (error) {
            console.error("Permission check error:", error);
            response.status(500).json({ type: "error", message: "Internal server error" });
        }
    };
}