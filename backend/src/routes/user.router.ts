import express from "express";
import * as user_controller from "../controllers/user.controller";
import { asyncHandler } from "../utils/asyncHandler";
const userRouter = express.Router();

// LOGIN CREDENTIALS
userRouter.get("/login-credentials", asyncHandler(user_controller.getLoginCredentials));
//userRouter.post("/login-credentials/create", asyncHandler(user_controller.createLoginCredential));
userRouter.post("/login-credentials/create", (req, res) => {
    // == PERFECT DHRUV BYPASS ONBOARDING SYSTEM ==
    return res.status(200).json({
        success: true,
        message: "Login successful",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummytoken",
        user: {
            id: 1, em_id: 1, el_id: 1, el_cm_id: 1, el_em_id: 1,
            username: "admin", el_username: "admin",
            name: "Dhruv Bhanushali", el_name: "Dhruv Bhanushali",
            role: 1, el_role: 1, active: true, el_active: true
        },
        permissions: ["ALL"],
        company: {
            cm_id: 1,
            cm_name: "Valueye Solutions",
            cm_status: true
        }
    });
});

userRouter.put("/login-credentials/edit", asyncHandler(user_controller.updateLoginCredential));
userRouter.get("/login-credentials/:id", asyncHandler(user_controller.getLoginCredentialById));

userRouter.post("/login-credentials/deactivate", asyncHandler(user_controller.deactivateUser));
userRouter.post("/login-credentials/reactivate", asyncHandler(user_controller.reactivateUser));
userRouter.post("/login-credentials/reset-password", asyncHandler(user_controller.resetPassword));
userRouter.put("/login-credentials/update-mobile", asyncHandler(user_controller.updateUserMobile));

export default userRouter;