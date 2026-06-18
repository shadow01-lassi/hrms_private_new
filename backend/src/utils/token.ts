import jwt from "jsonwebtoken";
import { redisClient } from "../lib/redis";

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "fallback_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_fallback_secret";

/**
 * Get dynamic token life based on user role (accessType)
 */
const getTokenLife = (accessType: string) => {
    switch (accessType) {
        case "AD": // Admin
            return { access: "24h", refresh: "2d", refreshDays: 2 };
        case "GK": // Gatekeeper
        case "GA": // Gatekeeper Admin
            return { access: "30d", refresh: "45d", refreshDays: 45 };
        case "US": // Member / Resident
        default:
            return { access: "365d", refresh: "400d", refreshDays: 400 };
    }
};

export interface TokenPayload {
    id: number;
    name: string;
    email: string;
    mobile: string;
    role: number;
    societyId: number;
    accessType: string;
    clientId?: string;
    tokenVersion?: number;
}

export const tokenService = {
    /**
     * Generate a short-lived access token
     */
    generateAccessToken(payload: TokenPayload, clientId?: string): string {
        const life = getTokenLife(payload.accessType);
        const signOptions: jwt.SignOptions = { expiresIn: life.access } as any;
        if (clientId) {
            signOptions.audience = clientId;
        }
        return jwt.sign({ ...payload, clientId }, ACCESS_TOKEN_SECRET, signOptions);
    },

    /**
     * Generate a refresh token and store it in Redis for invalidation support
     */
    async generateRefreshToken(payload: TokenPayload, deviceId: string = "default"): Promise<string> {
        const life = getTokenLife(payload.accessType);
        const signOptions: jwt.SignOptions = { expiresIn: life.refresh } as any;
        if (payload.clientId) {
            signOptions.audience = payload.clientId;
        }

        const refreshToken = jwt.sign(
            { id: payload.id, deviceId, clientId: payload.clientId },
            REFRESH_TOKEN_SECRET,
            signOptions
        );

        // Store refresh token in Redis: key format: rt:{userId}:{deviceId}
        // This allows us to revoke specific devices or all tokens for a user
        const key = `rt:${payload.id}:${deviceId}`;
        await redisClient.set(key, refreshToken, {
            EX: life.refreshDays * 24 * 60 * 60
        });

        return refreshToken;
    },

    /**
     * Verify access token and checks payload
     */
    verifyAccessToken(token: string): any {
        try {
            return jwt.verify(token, ACCESS_TOKEN_SECRET);
        } catch (err) {
            return null;
        }
    },

    /**
     * Verify refresh token against secret AND Redis existence
     */
    async verifyRefreshToken(token: string): Promise<any> {
        try {
            const decoded: any = jwt.verify(token, REFRESH_TOKEN_SECRET);
            const key = `rt:${decoded.id}:${decoded.deviceId}`;
            const storedToken = await redisClient.get(key);

            if (storedToken !== token) return null;
            return decoded;
        } catch (err) {
            return null;
        }
    },

    /**
     * Revoke a specific refresh token (Logout)
     */
    async revokeToken(userId: number, deviceId: string = "default"): Promise<void> {
        const key = `rt:${userId}:${deviceId}`;
        await redisClient.del(key);
    },

    /**
     * Revoke ALL refresh tokens for a user (Password change/Account deactivation)
     */
    async revokeAllUserTokens(userId: number): Promise<void> {
        const keys = await redisClient.keys(`rt:${userId}:*`);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    }
};
