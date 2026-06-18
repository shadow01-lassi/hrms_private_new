import { Request, Response, NextFunction } from "express";
import { decrypt, encrypt } from "../utils/encryption";
import { PROTECTED_PLATFORMS, MIN_APP_VERSIONS } from "../constants";

/**
 * Middleware to handle global encryption and decryption.
 * Decrypts incoming req.body if X-Encrypted header is present.
 * Encrypts outgoing res.json if X-Encrypted header was present in request.
 */
export const encryptionMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Bypass encryption logic for health check endpoints
    if (req.path === "/health" || req.path === "/health/db" || req.path === "/api/health/db") {
        return next();
    }

    // Inject the required version for the detected platform into every response
    if (req.clientId && MIN_APP_VERSIONS[req.clientId]) {
        res.setHeader("x-min-app-version", MIN_APP_VERSIONS[req.clientId]);
    }

    // TODO: Remove login bypass once frontend PLATFORM header is verified
    const isLoginRoute = req.path === "/api/login" || req.path === "/login" || req.path === "/api/register" || req.path === "/register";
    const protectedPlatforms = [...PROTECTED_PLATFORMS];
    const isOfficialPlatform = req.clientId && protectedPlatforms.includes(req.clientId);
    const isEncrypted = isLoginRoute ? req.headers["x-encrypted"] === "true" : (isOfficialPlatform && req.headers["x-encrypted"] === "true");

    // 1. Decrypt incoming request body
    if (isEncrypted && req.body && typeof req.body.data === "string") {
        try {
            const decryptedData = decrypt(req.body.data);
            req.body = JSON.parse(decryptedData);
        } catch (error) {
            console.error("Encryption Middleware: Decryption failed", error);
            return res.status(400).json({ success: false, message: "Invalid encrypted payload" });
        }
    }

    // 2. Wrap res.json to encrypt outgoing response
    const originalJson = res.json;
    res.json = function (data: any) {
        if (isEncrypted) {
            try {
                if (data && data.data) {
                    data.data = encrypt(JSON.stringify(data.data));
                    res.setHeader("x-encrypted", "true");
                }
            } catch (error) {
                console.error("Encryption Middleware: Encryption failed", error);
                return res.status(500).json({ success: false, message: "Response encryption failed" });
            }
        }
        return originalJson.call(this, data);
    };

    next();
};
