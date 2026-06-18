import express from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as sidebar_controller from "../controllers/sidebar.controller";

const sidebarRouter = express.Router();

sidebarRouter.get("/", asyncHandler(sidebar_controller.getSidebar));
sidebarRouter.get("/tree", asyncHandler(sidebar_controller.getSidebarTree));
sidebarRouter.get("/all", asyncHandler(sidebar_controller.getAllMenuItems));
sidebarRouter.post("/", asyncHandler(sidebar_controller.createMenuItem));
sidebarRouter.put("/:id", asyncHandler(sidebar_controller.updateMenuItem));
sidebarRouter.delete("/:id", asyncHandler(sidebar_controller.deleteMenuItem));
sidebarRouter.post("/reorder", asyncHandler(sidebar_controller.updateMenuOrder));

export default sidebarRouter;