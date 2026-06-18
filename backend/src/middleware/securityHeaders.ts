import { Request, Response, NextFunction } from "express";

/**
 * Middleware to set minimal security headers on every response.
 * This version is simplified to avoid any issues with local development or browser caching.
 */
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Nosniff: Prevents MIME type sniffing (safe & best practice)
    res.setHeader("X-Content-Type-Options", "nosniff");

    // 2. Clickjacking Protection: DENY is safe for APIs
    res.setHeader("X-Frame-Options", "DENY");

    // 3. Referrer Policy: Standard policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // 4. Relaxed CSP: Only for direct viewing of API responses
    // We allow everything to avoid breaking the frontend during development.
    res.setHeader(
        "Content-Security-Policy",
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors 'none';"
    );

    // 5. Explicitly DISABLE HSTS for localhost/127.0.0.1
    // This cleans up any persistent HTTPS redirects from previous strict headers.
    const isLocal = req.headers.host?.includes("localhost") || req.headers.host?.includes("127.0.0.1");
    if (isLocal) {
        res.setHeader("Strict-Transport-Security", "max-age=0");
    }

    // 6. Disable X-Powered-By header
    res.removeHeader("X-Powered-By");

    next();
};
