import { Request, Response } from "express";
import * as perm_dao from "../dao/permission.dao";
import { CacheKeys } from "../lib/cacheKeys";
import { getOrSetCache, TTL, deleteByPattern, deleteCache } from "../lib/cache";
import { CACHE_PREFIX } from "../constants";
import { pool } from "../lib/db";

export const getPermissions = async (request: Request, response: Response): Promise<void> => {
    const results = await getOrSetCache(
        CacheKeys.global.permissions(),
        TTL.MASTER_LONG,
        () => perm_dao.getAllPermissionsDAO()
    );
    if (results) {
        response.status(200).json({ type: "success", message: "Permissions fetched successfully", data: results });
    }
    else {
        throw new Error("Some error occurred while fetching permissions");
    }
};

export const getMyPermissions = async (request: Request, response: Response): Promise<void> => {
    const roleId = Number(request.user?.role);
    if (!roleId) {
        response.status(401).json({ type: "error", message: "User role not found" });
        return;
    }

    const permissions = await perm_dao.getRolePermissionsDAO(roleId);
    const pmCodes = permissions.map((p: any) => p.pm_code);

    response.status(200).json({
        type: "success",
        message: "Current permissions fetched successfully",
        data: pmCodes
    });
};

export const getRolePermissions = async (request: Request, response: Response): Promise<void> => {
    const { rm_id } = request.params;
    const roleId = Number(rm_id);

    // Fetch role details and permissions in parallel
    const [roleRes, permissions] = await Promise.all([
        pool.query("SELECT rm_name, rm_description FROM role_master WHERE rm_id = $1", [roleId]),
        perm_dao.getRolePermissionsDAO(roleId)
    ]);

    const role = roleRes.rows[0];
    if (role) {
        response.status(200).json({
            type: "success",
            message: "Role fetched successfully",
            data: {
                ...role,
                permissions
            }
        });
    }
    else {
        throw new Error("Role not found");
    }
};

export const createRole = async (request: Request, response: Response): Promise<void> => {
    const username = request.user?.username;
    const { rm_name, rm_description, pm_ids } = request.body;
    const rm_id = await perm_dao.createRoleWithPermissionsDAO(rm_name, rm_description, pm_ids, username);

    if (rm_id) {
        response.status(201).json({ type: "success", message: "Role created successfully", data: { rm_id } });
    } else {
        throw new Error("Failed to create role");
    }
};

export const updateRolePermissions = async (request: Request, response: Response): Promise<void> => {
    const { rm_id, rm_name, rm_description, pm_ids } = request.body;
    const user_name = (request as any).user?.ul_name || "system";
    const companyId = (request as any).user?.company;

    const results = await perm_dao.updateRoleWithPermissionsDAO(Number(rm_id), rm_name, rm_description, pm_ids, user_name);
    if (results) {
        // Invalidate cache for permissions and sidebar
        try {
            // 1. Clear permission check cache for all users in this company
            if (companyId) {
                const permissionPattern = `${CACHE_PREFIX}company:${companyId}:user:*:permission:*`;
                await deleteByPattern(permissionPattern);
            }

            // 2. Clear sidebar cache for this role
            const sidebarPattern = `${CACHE_PREFIX}global:sidebar:${rm_id}:*`;
            await deleteByPattern(sidebarPattern);

            // 3. Clear global roles cache
            await deleteCache(CacheKeys.global.roles.all());
            await deleteCache(CacheKeys.global.roles.one(Number(rm_id)));
        } catch (cacheError) {
            console.error("Cache invalidation error:", cacheError);
            // Don't fail the request if cache clearing fails
        }

        response.status(200).json({ type: "success", message: "Role and permissions updated successfully" });
    }
    else {
        throw new Error("Some error occurred while updating role permissions");
    }
};