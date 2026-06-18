import { Request, Response } from "express";
import * as change_log_dao from "../dao/change-log.dao";
import { CacheKeys } from "../lib/cacheKeys";
import { getOrSetCache, TTL, deleteCache } from "../lib/cache";

export async function getChangeLogController(req: Request, res: Response) {
    try {
        const cacheKey = CacheKeys.global.changeLog();
        const cachedData = await getOrSetCache(cacheKey, TTL.MASTER_LONG, async () => {
            return await change_log_dao.getChangeLog();
        });
        return res.status(200).json({ type: "success", data: cachedData });
    } catch (error) {
        console.error("Error fetching change log:", error);
        return res.status(500).json({ type: "error", error: "Internal server error" });
    }
}

export async function getChangeLogByIdController(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const data = await change_log_dao.getChangeLogById(id);
        if (!data) return res.status(404).json({ type: "error", error: "Change log not found" });
        return res.status(200).json({ type: "success", data });
    } catch (error) {
        console.error("Error fetching change log by ID:", error);
        return res.status(500).json({ type: "error", error: "Internal server error" });
    }
}

export async function createChangeLogController(req: Request, res: Response) {
    try {
        const data = await change_log_dao.createChangeLog(req.body);
        await deleteCache(CacheKeys.global.changeLog());
        return res.status(201).json({ type: "success", data });
    } catch (error) {
        console.error("Error creating change log:", error);
        return res.status(500).json({ type: "error", error: "Internal server error" });
    }
}

export async function updateChangeLogController(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const data = await change_log_dao.updateChangeLog(id, req.body);
        await deleteCache(CacheKeys.global.changeLog());
        return res.status(200).json({ type: "success", data });
    } catch (error) {
        console.error("Error updating change log:", error);
        return res.status(500).json({ type: "error", error: "Internal server error" });
    }
}

export async function deleteChangeLogController(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        await change_log_dao.deleteChangeLog(id);
        await deleteCache(CacheKeys.global.changeLog());
        return res.status(200).json({ type: "success", message: "Deleted successfully" });
    } catch (error) {
        console.error("Error deleting change log:", error);
        return res.status(500).json({ type: "error", error: "Internal server error" });
    }
}