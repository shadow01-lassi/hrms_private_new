import { Request, Response, NextFunction } from "express";
import * as xss from "xss";

// Configure XSS to be extremely strict
const xssOptions: xss.IFilterXSSOptions = {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script"],
    css: false, // don't allow inline CSS
};

// Use the constructor properly
const xssFilter = new xss.FilterXSS(xssOptions);

/**
 * Recursively sanitize an object to strip HTML tags
 */
const sanitize = (data: any): any => {
    if (typeof data === "string") {
        return xssFilter.process(data);
    }

    // Only recurse if it's an array or a PURE object (prevent binary/date issues)
    if (Array.isArray(data)) {
        return data.map(val => sanitize(val));
    }

    if (typeof data === "object" && data !== null && Object.getPrototypeOf(data) === Object.prototype) {
        const sanitized: any = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                sanitized[key] = sanitize(data[key]);
            }
        }
        return sanitized;
    }

    return data;
};

/**
 * XSS Protection Middleware
 */
export const xssMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body) req.body = sanitize(req.body);
        if (req.query) req.query = sanitize(req.query);
        if (req.params) req.params = sanitize(req.params);
        next();
    } catch (err) {
        console.error("[XSS Middleware Error]:", err);
        // If sanitization fails, we proceed as a fallback but log it
        next();
    }
};
