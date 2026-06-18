import express from "express";
import * as user_controller from "../controllers/user.controller";
import { asyncHandler } from "../utils/asyncHandler";
import * as onboard_controller from "../controllers/onboard.controller";
import * as upload_controller from "../controllers/upload.controller";
import { upload } from "../lib/multer";
import bankRouter from "./bank.route";

const userRouter = express.Router();

// ONBOARDING STATUS
userRouter.get("/status", asyncHandler(onboard_controller.getOnboardingStatusController));

// STEP 1
userRouter.post("/step-1", asyncHandler(onboard_controller.createCompanyController));
userRouter.post("/step-1/otp-verify", asyncHandler(onboard_controller.verifyOTPController));

// STEP 2
userRouter.get("/step-2", asyncHandler(onboard_controller.getOnboardingStep2Controller));
userRouter.post("/step-2/upload/image", upload.single("file"), asyncHandler(upload_controller.uploadImage));
userRouter.post("/step-2", asyncHandler(onboard_controller.updateCompanyDetailsController));
userRouter.get("/step-2/check-registration", asyncHandler(onboard_controller.checkRegistrationController));
userRouter.get("/step-2/check-pan", asyncHandler(onboard_controller.checkPanController));
userRouter.get("/step-2/check-gst", asyncHandler(onboard_controller.checkGSTINController));

// STEP 4
userRouter.get("/step-4", asyncHandler(onboard_controller.getOnboardingStep4Controller));
userRouter.post("/step-4", asyncHandler(onboard_controller.onboardAdminLoginsController));
userRouter.get("/step-4/check-username", asyncHandler(onboard_controller.checkUsernameController));
userRouter.get("/step-4/check-email", asyncHandler(onboard_controller.checkEmailController));
userRouter.get("/step-4/check-mobile", asyncHandler(onboard_controller.checkMobileController));
userRouter.post("/step-4-old", asyncHandler(user_controller.getLoginCredentialById));

// STEP 5
// userRouter.get("/step-5/maintenance-setup", asyncHandler(billing_controller.getMaintenanceSetup));
// userRouter.put("/step-5", asyncHandler(billing_controller.updateMaintenanceSetup));

// Step 6: Member Management
// userRouter.get("/step-6/members", asyncHandler(master_controller.getFlatOwners));
// userRouter.get("/step-6/members/details", asyncHandler(master_controller.getFlatOnwerDetails));
// userRouter.post("/step-6/members", asyncHandler(master_controller.insertUpdateFlatOwner));
// userRouter.post("/step-6/members/bulk-import", asyncHandler(onboard_controller.importResidentsBulkController));

// STEP 8
userRouter.post("/step-8/apply", asyncHandler(onboard_controller.applyForVerificationController));

// BANK ROUTES
userRouter.use("/banks", bankRouter);

export default userRouter;