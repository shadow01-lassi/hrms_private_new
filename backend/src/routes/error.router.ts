import express from "express";
import * as error_controller from "../controllers/error.controller";
import { asyncHandler } from "../utils/asyncHandler";

const errorRouter = express.Router();

errorRouter.post("/all", asyncHandler(error_controller.getErrors));
errorRouter.post("/register", asyncHandler(error_controller.registerError));

export default errorRouter;
