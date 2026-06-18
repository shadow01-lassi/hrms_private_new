import express from "express";
import * as dashboard_controller from "../controllers/dashboard.controller";
import { asyncHandler } from "../utils/asyncHandler";

const dashboardRouter = express.Router();

dashboardRouter.get("/", asyncHandler(dashboard_controller.getDashboardData));
dashboardRouter.get("/new", asyncHandler(dashboard_controller.getDashboardDataNew));
dashboardRouter.get("/hrms", asyncHandler(dashboard_controller.getHRMSDashboardData));

export default dashboardRouter;
