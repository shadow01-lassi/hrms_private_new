import express from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as report_controller from "../controllers/report.controller";

const reportRouter = express.Router();

reportRouter.get("/get-by-query", asyncHandler(report_controller.getContentByQuery));
reportRouter.get("/standard", asyncHandler(report_controller.getStandardReport));
reportRouter.get("/standard/lov", asyncHandler(report_controller.getStandardReport));
reportRouter.post("/standard/:id/execute", asyncHandler(report_controller.getQueryReport));

export default reportRouter;