import { Request, Response } from "express";
import * as role_dao from "../dao/role.dao";
import { CacheKeys } from "../lib/cacheKeys";
import { deleteCache, getOrSetCache, TTL } from "../lib/cache";

export const getExistingRoles = async (request: Request, response: Response): Promise<void> => {
    const results = await getOrSetCache(
        CacheKeys.global.roles.all(),
        TTL.MASTER_LONG,
        () => role_dao.getRoles()
    );
    if (results) {
        response.status(200).json({ type: "success", message: "Role fetched successfully", data: results });
    }
    else {
        throw new Error("Some error occured while fetching role");
    }
};

export const getExistingRole = async (request: Request, response: Response): Promise<void> => {
    const { id } = request.body;

    const results = await getOrSetCache(
        CacheKeys.global.roles.one(Number(id)),
        TTL.MASTER_LONG,
        () => role_dao.getRole(id)
    );

    if (results) {
        response.status(200).json({ type: "success", message: "Role fetched successfully", data: results });
    }
    else {
        throw new Error("Some error occured while fetching role");
    }
};

export const createNewRole = async (request: Request, response: Response): Promise<void> => {
    try {
        const { name, array, description } = request.body;

        const results = await role_dao.createRole(name, array, description);
        console.log(results);
        if (results && results.length > 0) {
            await deleteCache(CacheKeys.global.roles.all());
            response.status(200).json({ type: "success", message: "Role created successfully" });
        }
        else {
            response.status(401).json({ type: "error", message: "Role creation failed" });
        }
    } catch (error) {
        console.log(error);
    }
};

export const editExistingRole = async (request: Request, response: Response): Promise<void> => {
    const { id, name, array, description } = request.body;

    const results = await role_dao.editRole(id, name, array, description);
    if (results && results.length > 0) {
        await Promise.all([
            deleteCache(CacheKeys.global.roles.all()),
            deleteCache(CacheKeys.global.roles.one(Number(id))),
        ]);
        response.status(200).json({ type: "success", message: "Role updated successfully", data: results });
    }
    else {
        throw new Error("Some error occured  while creating user");
    }
};