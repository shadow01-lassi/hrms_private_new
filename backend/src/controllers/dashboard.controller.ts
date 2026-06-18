import { Request, Response } from "express";
import * as dash_dao from "../dao/dashboard.dao";

// importing cache layer
import { getOrSetCache, TTL } from "../lib/cache";
import { CacheKeys } from "../lib/cacheKeys";

export const getDashboardData = async (req: Request, res: Response) => {
    const { company } = req.query;

    if (!company) {
        res.status(400).json({ type: "error", message: "Company ID is required" });
        return;
    }

    const data = await dash_dao.getDashboardDataDao(Number(company));

    res.status(200).json({
        type: "success",
        data: data
    });
};

export const getDashboardDataNew = async (req: Request, res: Response) => {
    const { company, fy } = req.query;

    if (!company || !fy) {
        res.status(400).json({ type: "error", message: "Company ID and FY are required" });
        return;
    }

    try {
        const companyId = Number(company);
        const fyString = String(fy);

        console.log(companyId, fyString);

        const [management, accounts, gatekeeper] = await Promise.all([
            getOrSetCache(
                CacheKeys.company.dashboard.management(companyId, fyString),
                TTL.MICRO,
                () => dash_dao.getDashboardManagementDataDao(companyId)
            ),
            getOrSetCache(
                CacheKeys.company.dashboard.accounts(companyId, fyString),
                TTL.MICRO,
                () => dash_dao.getDashboardAccountsDataDao(companyId, fyString)
            ),
            getOrSetCache(
                CacheKeys.company.dashboard.gatekeeper(companyId, fyString),
                TTL.MICRO,
                () => dash_dao.getDashboardGatekeeperDataDao(companyId)
            )
        ]);

        res.status(200).json({
            type: "success",
            data: {
                management,
                accounts,
                gatekeeper
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ type: "error", message: "Internal Server Error" });
    }
};

export const getHRMSDashboardData = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await dash_dao.getHRMSDashboardCountsDAO();
        res.status(200).json({
            type: "success",
            message: "HRMS dashboard data fetched successfully",
            data: data
        });
    } catch (error: any) {
        console.error("Error fetching HRMS dashboard data:", error);
        res.status(500).json({ type: "error", message: "Internal Server Error" });
    }
};

