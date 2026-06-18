import jwt, { TokenExpiredError } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { getCompanyByEmailDAO } from "../dao/company.dao";
import { CacheKeys } from "../lib/cacheKeys";
import { getOrSetCache, TTL } from "../lib/cache";
import { CompanyMasterType } from "../types";

/**
 * Middleware to verify if a company is legitimate by checking details from the JWT token.
 * Uses Redis to cache valid companies for performance via the getOrSetCache pattern.
 */
export const verifyCompanyLegitimacy = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({
                type: "error",
                message: "Authorization token is missing or invalid",
            });
            return;
        }

        const token = authHeader.split(" ")[1];

        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        } catch (err) {
            if (err instanceof TokenExpiredError) {
                res.status(401).json({
                    type: "error",
                    message: "token_expired",
                });
                return;
            }

            res.status(401).json({
                type: "error",
                message: "Token verification failed",
            });
            return;
        }

        const { cm_id, cm_name, cm_email } = decoded;

        if (!cm_id || !cm_email) {
            res.status(401).json({
                type: "error",
                message: "Invalid token payload: Company details missing",
            });
            return;
        }

        // Logic: Get from cache if present, else fetch from DB
        const company = await getOrSetCache<CompanyMasterType | null>(
            CacheKeys.company.byEmail(Number(cm_id), cm_email),
            TTL.MASTER_LONG,
            async () => {
                const companies = await getCompanyByEmailDAO(cm_email);
                if (!companies || companies.length === 0) return null;
                return companies[0] as CompanyMasterType;
            }
        );

        if (!company) {
            res.status(404).json({
                type: "error",
                message: "Legitimate society not found",
            });
            return;
        }

        // Check if DB/Cache details match exactly with the Token details
        const isMatch = (
            company.cm_id === Number(cm_id) &&
            company.cm_name === cm_name &&
            company.cm_email === cm_email
        );

        if (isMatch) {
            req.company = company;
            return next();
        }

        res.status(403).json({
            type: "error",
            message: "Security mismatch: Society records do not match the token provided",
        });
    } catch (error) {
        console.error("Error in verifyCompanyLegitimacy middleware:", error);
        res.status(500).json({
            type: "error",
            message: "Internal server error during company verification",
        });
    }
};
