import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { logErrorToDB } from "../../lib/errorLogger";

const sanitizeRequestBody = (body: any) => {
    if (!body) return null;

    const clone = { ...body };

    const sensitiveFields = ["password", "token", "accessToken", "refreshToken"];

    sensitiveFields.forEach((field) => {
        if (clone[field]) clone[field] = "***MASKED***";
    });

    return clone;
};

const sendErrorDev = (err: any, res: Response) => {
    return res.status(err.statusCode).json({
        type: "error",
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err,
    });
};

const sendErrorProd = (err: any, res: Response) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            type: "error",
            status: err.status,
            message: err.message,
        });
    }

    // Programming or unknown error
    return res.status(500).json({
        type: "error",
        message: "Something went very wrong!",
    });
};

export default (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (res.headersSent) {
        return next(err);
    }

    // Normalize error
    let error = err;

    if (!(err instanceof AppError)) {
        error = new AppError(
            err.message || "Unexpected Error",
            err.statusCode || 500,
            "CRITICAL"
        );
        error.stack = err.stack;
        error.isOperational = false;
    }

    // Log asynchronously (do not await)
    logErrorToDB({
        userId: (req as any).user?.id,
        username: (req as any).user?.username,
        role: (req as any).user?.role,
        platform: (req as any).user?.platform || "unknown",
        page: req.originalUrl,
        functionName: err.functionName || "unknown",
        error: error,
        httpMethod: req.method,
        endpoint: req.originalUrl,
        statusCode: error.statusCode,
        requestBody: sanitizeRequestBody(req.body),
        requestParams: req.params,
        requestQuery: req.query,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        severity: error.severity || "ERROR",
    } as any).catch((loggingErr) => {
        console.error("Error logging failed:", loggingErr);
    });

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(error, res);
        return;
    }

    sendErrorProd(error, res);
};
