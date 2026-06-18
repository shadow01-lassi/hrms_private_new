import { Request, Response } from "express";
import * as side_dao from "../dao/sidebar.dao";

export const getSidebar = async (request: Request, response: Response): Promise<void> => {
    // Session data is trustworthily attached by verifyToken middleware
    const user = request.user;

    if (!user) {
        response.status(401).json({ type: "error", message: "Unauthorized" });
        return;
    }

    const { role, access } = user;

    // We cast to Number where necessary for the DAO
    const results = await side_dao.getSidebarFromRole(Number(role), access);

    if (results.length > 0) {
        response.status(200).json({ type: "success", message: "Sidebar details fetched successfully", data: results });
    }
    else {
        response.status(200).json({ type: "success", message: "No sidebar items found for current access", data: [] });
    }
};

export const getAllMenuItems = async (request: Request, response: Response): Promise<void> => {
    try {
        const results = await side_dao.getAllMenuItemsDAO();
        response.status(200).json({ type: "success", data: results });
    } catch (error: any) {
        response.status(500).json({ type: "error", message: error.message });
    }
};

export const createMenuItem = async (request: Request, response: Response): Promise<void> => {
    try {
        const result = await side_dao.createMenuItemDAO(request.body);
        response.status(201).json({ type: "success", message: "Menu item created", data: result });
    } catch (error: any) {
        response.status(500).json({ type: "error", message: error.message });
    }
};

export const updateMenuItem = async (request: Request, response: Response): Promise<void> => {
    try {
        const { id } = request.params;
        const result = await side_dao.updateMenuItemDAO(Number(id), request.body);
        response.status(200).json({ type: "success", message: "Menu item updated", data: result });
    } catch (error: any) {
        response.status(500).json({ type: "error", message: error.message });
    }
};

export const deleteMenuItem = async (request: Request, response: Response): Promise<void> => {
    try {
        const { id } = request.params;
        const result = await side_dao.deleteMenuItemDAO(Number(id));
        response.status(200).json({ type: "success", message: "Menu item deleted", data: result });
    } catch (error: any) {
        response.status(500).json({ type: "error", message: error.message });
    }
};

export const updateMenuOrder = async (request: Request, response: Response): Promise<void> => {
    try {
        const { orders } = request.body;
        await side_dao.updateMenuOrderDAO(orders);
        response.status(200).json({ type: "success", message: "Menu order updated" });
    } catch (error: any) {
        response.status(500).json({ type: "error", message: error.message });
    }
};

export const getSidebarTree = async (request: Request, response: Response): Promise<void> => {
    try {
        const results = await side_dao.getSidebarTreeView();
        if (results.length > 0) {
            response.status(200).json({ type: "success", message: "Sidebar Tree View details fetched successfully", data: results });
        }
        else {
            response.status(200).json({ type: "success", message: "No sidebar tree view found", data: [] });
        }
    } catch (error: any) {
        response.status(500).json({ type: "error", message: error.message });
    }
};