import { Request, Response, NextFunction } from "express";

/**
 * Structured API Request Logger Middleware
 * Captures: IP, Method, Path, Status, Response Time
 * Excludes: Sensitive data (Passwords, Tokens, OTPs) from logs entirely.
 * Format: JSON for easy integration with monitoring tools.
 */
export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, path, ip } = req;

    // Use x-forwarded-for if behind a proxy like Nginx/ngrok
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || ip;

    // We do NOT log req.body or req.query here to strictly ensure 
    // sensitive data (passwords, tokens, OTPs) NEVER enters the logs.

    res.on("finish", () => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;

        const logData = {
            timestamp: new Date().toISOString(),
            ip: clientIp,
            method,
            path,
            status: statusCode,
            duration: `${duration}ms`,
            userAgent: req.headers['user-agent'] || 'unknown'
        };
        req.query.ip = clientIp ?? "";
    });

    next();
};
