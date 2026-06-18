import express from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as password_controller from "../controllers/password.controller";
const passwordRouter = express.Router();

passwordRouter.post("/forgot-password", asyncHandler(password_controller.forgotPasswordRequestController));
passwordRouter.post("/verify-otp", asyncHandler(password_controller.verifyOTPController));
passwordRouter.post("/reset-password", asyncHandler(password_controller.resetPasswordController));

export default passwordRouter;