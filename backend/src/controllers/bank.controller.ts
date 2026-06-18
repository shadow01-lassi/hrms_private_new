import { Request, Response } from "express";
import * as bank_dao from "../dao/bank.dao";
import { getOrSetCache, TTL } from "../lib/cache";
import { CacheKeys } from "../lib/cacheKeys";

export const getBankNames = async (request: Request, response: Response) => {
    const cacheKey = CacheKeys.global.banks.all();

    const results = await getOrSetCache(
        cacheKey,
        TTL.MASTER_LONG,
        () => bank_dao.getBankNamesDAO()
    );

    response.status(200).json({ type: "success", message: "Successfully fetched bank names", data: results });
};

export const getBankBranches = async (request: Request, response: Response) => {
    const { bankId } = request.params;
    const { q } = request.query;

    if (!bankId) {
        response.status(400).json({ type: "error", message: "Bank ID parameter is required" });
        return;
    }

    const searchQuery = String(q || "");
    // Since we have search queries, cache key includes the search string to avoid poisoning the cache
    const cacheKey = `${CacheKeys.global.banks.branches(bankId)}:${searchQuery}`;

    const results = await getOrSetCache(
        cacheKey,
        TTL.MASTER,
        () => bank_dao.getBankBranchesDAO(bankId, searchQuery)
    );

    response.status(200).json({ type: "success", message: "Successfully fetched bank branches", data: results });
};

export const searchIFSCCode = async (request: Request, response: Response) => {
    const { code } = request.params;

    if (!code) {
        response.status(400).json({ type: "error", message: "IFSC code parameter is required" });
        return;
    }

    const cacheKey = CacheKeys.global.banks.ifsc(code);

    const results = await getOrSetCache(
        cacheKey,
        TTL.MASTER,
        () => bank_dao.searchIFSCCode(code)
    );

    if (!results || results.length === 0) {
        response.status(404).json({ type: "error", message: "IFSC not found" });
        return;
    }

    response.status(200).json({
        type: "success",
        message: "Successfully fetched IFSC code details",
        data: {
            bankName: results[0].bank_name,
            branch: results[0].branch,
            ifsc: results[0].ifsc
        }
    });
};
