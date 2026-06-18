import { Request, Response } from "express";
import { defaultStyle as legacyDefaultStyle } from "../data/styles";
import { getOrSetCache, TTL, deleteCache } from "../lib/cache";
import { CacheKeys } from "../lib/cacheKeys";
import * as styleDAO from "../dao/style.dao";

// Helper to map DB row to the format expected by the frontend
const mapStyleFromDB = (dbRow: any) => {
    if (!dbRow) return null;
    return {
        hostname: dbRow.hs_hostname,
        BG_COLOR: dbRow.hs_bg_color,
        TEXT_COLOR: dbRow.hs_text_color,
        PRIMARY_COLOR: dbRow.hs_primary_color,
        APP_NAME: dbRow.hs_app_name,
        APP_LOGO: dbRow.hs_app_logo,
        LIGHT_THEME_COLORS: dbRow.hs_light_theme_colors,
        DARK_THEME_COLORS: dbRow.hs_dark_theme_colors,
    };
};

export const getStyle = async (req: Request, res: Response): Promise<void> => {
    try {
        const hostname = (req.query.hostname as string) || req.headers.host || "";
        console.log("Fetching DB style for hostname:", hostname);

        const matchedStyle = await getOrSetCache(
            CacheKeys.global.style(hostname),
            TTL.MASTER_LONG,
            async () => {
                try {
                    const dbStyle = await styleDAO.getStyleByHostnameDAO(hostname);
                    if (dbStyle) {
                        return mapStyleFromDB(dbStyle);
                    }
                } catch (dbError: any) {
                    console.warn("Database error in getStyleByHostnameDAO, falling back to legacyDefaultStyle:", dbError.message);
                }
                // Fallback to legacy defaultStyle if nothing in DB or query fails
                return legacyDefaultStyle;
            }
        );

        res.status(200).json({
            type: "success",
            data: matchedStyle
        });
    } catch (error) {
        console.error("Error in getStyle:", error);
        res.status(200).json({
            type: "success",
            data: legacyDefaultStyle
        });
    }
};

export const updateStyle = async (req: Request, res: Response): Promise<void> => {
    try {
        const { hostname, ...styleData } = req.body;

        if (!hostname) {
            res.status(400).json({ type: "error", message: "Hostname is required" });
            return;
        }

        const daoData: styleDAO.IHostnameStyle = {
            hs_hostname: hostname,
            hs_bg_color: styleData.BG_COLOR,
            hs_text_color: styleData.TEXT_COLOR,
            hs_primary_color: styleData.PRIMARY_COLOR,
            hs_app_name: styleData.APP_NAME,
            hs_app_logo: styleData.APP_LOGO,
            hs_light_theme_colors: styleData.LIGHT_THEME_COLORS || {},
            hs_dark_theme_colors: styleData.DARK_THEME_COLORS || {},
        };

        await styleDAO.upsertStyleDAO(daoData);

        // Invalidate cache for this hostname
        await deleteCache(CacheKeys.global.style(hostname));

        // Success response
        res.status(200).json({
            type: "success",
            message: "Style updated successfully in DB",
            data: { hostname, ...styleData }
        });
    } catch (error) {
        console.error("Error in updateStyle:", error);
        res.status(500).json({
            type: "error",
            message: "Failed to update style data"
        });
    }
};
