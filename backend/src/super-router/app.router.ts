import express from "express";

// MIDDLEWARE FUNCTIONS
import { verifyToken } from "../middleware/middleware";

// RATE LIMITS
import { rateLimit } from "../lib/redis";

// STAND ALONE CONTROLLER FUNCTIONS
import {
    loginUser,
    verifyDeviceOtpController,
    resendDeviceOtpController,
    logoutUserController,
    refreshTokenController,
    setPasswordController,
    registerUserController
} from "../controllers/user.controller";
import { sendEmailExport } from "../controllers/email.controller";
import { getStyle, updateStyle } from "../controllers/style.controller";

// ALL APP ROUTES
import userRouter from "../routes/user.router";
import sidebarRouter from "../routes/sidebar.route";
import roleRouter from "../routes/role.route";
import masterRouter from "../routes/master.route";
import reportRouter from "../routes/reports.route";
import uploadRouter from "../routes/upload.route";
import onboardRouter from "../routes/onboard.route";
import errorRouter from "../routes/error.router";
import permissionRouter from "../routes/permission.route";
import openRouter from "../routes/open.route";
import passwordRouter from "../routes/password.route";
import dashboardRouter from "../routes/dashboard.route";
import { healthCheck } from "../lib/db";

const appRouter = express();

// ===========================================
// |               OPEN ROUTES               |
// ===========================================
appRouter.get("/health/db", async (req, res) => {
    const status = await healthCheck();
    if (status.status === "UP") {
        return res.status(200).json(status);
    } else {
        return res.status(500).json(status);
    }
});

appRouter.use("/open", openRouter);

// ===========================================
// |               ONBOARD ROUTES            |
// ===========================================
appRouter.use("/onboard", onboardRouter);

// ===========================================
// |               AUTH ROUTES               |
// ===========================================
appRouter.use("/login", rateLimit(5, 60), loginUser);
appRouter.post("/register", rateLimit(5, 60), registerUserController);
appRouter.post("/verify-otp", rateLimit(5, 60), verifyDeviceOtpController);
appRouter.post("/resend-otp", rateLimit(5, 60), resendDeviceOtpController);
appRouter.post("/refresh-token", refreshTokenController);
appRouter.put("/set-password", rateLimit(5, 60), setPasswordController);
appRouter.post("/logout", verifyToken, logoutUserController);

appRouter.use("/password", rateLimit(5, 60), passwordRouter);
appRouter.use("/user", verifyToken, userRouter);
appRouter.use("/sidebar", verifyToken, sidebarRouter);
appRouter.use("/role", verifyToken, roleRouter);
appRouter.use("/permission", verifyToken, permissionRouter);
appRouter.use("/error", errorRouter);
appRouter.post("/email", sendEmailExport);
appRouter.get("/style", getStyle);
appRouter.patch("/style", updateStyle);

// ===========================================
// |             REQUEST ROUTES              |
// ===========================================
appRouter.use("/report", verifyToken, reportRouter);
appRouter.use("/master", verifyToken, masterRouter);
appRouter.use("/upload", verifyToken, uploadRouter);
appRouter.use("/dashboard", verifyToken, dashboardRouter);

appRouter.get("/accounts/fin-year", verifyToken, (req, res) => {
    return res.status(200).json({
        type: "success",
        data: [
            {
                fy_id: 1,
                fy_code: "2025-2026",
                fy_start_date: "2025-04-01",
                fy_end_date: "2026-03-31",
                fy_remarks: "Mock Fin Year"
            }
        ]
    });
});

export default appRouter;