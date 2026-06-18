import { Request, Response, NextFunction } from "express";

/**
 * A wrapper utility for async Express route handlers and middleware.
 * It catches rejected promises and forwards them to the global error handler.
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};
