import { Request, Response } from "express";

import { OTPManager } from "../lib/otp";
import * as user_dao from "../dao/user.dao";
import bcrypt from "bcryptjs";
import sendMail from "../lib/mail";
import { ADDRESS, APP_NAME, WEBSITE_URL } from "../constants";
import { getOrSetCache, TTL, deleteCache } from "../lib/cache";
import { CacheKeys } from "../lib/cacheKeys";
import { RESET_PASSWORD_OTP_VERIFICATION_EMAIL } from "../templates/email-templates";

export const otpManager = new OTPManager();

export const forgotPasswordRequestController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ type: "error", message: "Email is required" });
            return;
        }

        const user = await getOrSetCache(CacheKeys.global.userLookup(email), TTL.MICRO, () => user_dao.getUserByEmailOrMobile(email));

        if (!user) {
            res.status(404).json({ type: "error", message: "Email not found" });
            return;
        }

        if (!user.ul_email) {
            res.status(400).json({ type: "error", message: "User does not have an email associated" });
            return;
        }

        const otp = otpManager.generateOTP(user.ul_email, user.ul_email);
        const htmlContent = RESET_PASSWORD_OTP_VERIFICATION_EMAIL(user.ul_name || user.ul_username, otp, user.ul_email);

        const results = await sendMail(user.ul_email, `${APP_NAME} - Password Reset OTP`, htmlContent);

        if (!results) {
            res.status(400).json({ type: "error", message: "Error sending OTP" });
            return;
        }

        // Store OTP with expiry time (5 minutes)
        console.log('====================================');
        console.log(email, otp);
        console.log('====================================');

        res.status(200).json({ type: "success", message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error generating OTP:", error);
        res.status(500).json({ type: "error", message: "Error generating OTP" });
    }
};

export const verifyOTPController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ type: "error", message: "Email and OTP are required" });
            return;
        }

        const emailExists = await getOrSetCache(CacheKeys.global.userLookup(email), TTL.MICRO, () => user_dao.getUserByEmailOrMobile(email));

        if (!emailExists) {
            res.status(404).json({ type: "error", message: "Email not found" }); // Changed to 404 for not found
            return;
        }

        if (!emailExists.ul_email) {
            res.status(400).json({ type: "error", message: "Email not found" }); // Changed to 404 for not found
            return;
        }

        const isValid = otpManager.verifyOTP(emailExists.ul_email, otp);

        if (!isValid) {
            res.status(400).json({ type: "error", message: "Invalid OTP" });
            return;
        }

        res.status(200).json({ type: "success", message: "OTP verified successfully" });
    } catch (error) {
        res.status(500).json({ type: "error", message: "Error verifying OTP" });
    }
};

export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { company } = req.query;
        const { email, otp, newPassword } = req.body;

        if (!email || !newPassword) {
            res.status(400).json({ type: "error", message: "Email and new password are required" });
            return;
        }

        const emailExists = await getOrSetCache(CacheKeys.global.userLookup(email), TTL.MICRO, () => user_dao.getUserByEmailOrMobile(email));

        if (!emailExists) {
            res.status(404).json({ type: "error", message: "Email not found" }); // Changed to 404 for not found
            return;
        }

        if (!emailExists.ul_email) {
            res.status(400).json({ type: "error", message: "Email not found" }); // Changed to 404 for not found
            return;
        }

        const isValid = otpManager.verifyOTP(emailExists.ul_email, otp);

        if (!isValid) {
            res.status(400).json({ type: "error", message: "Invalid OTP" });
            return;
        }

        const hashedPassword = await bcrypt.hashSync(newPassword);

        const results = await user_dao.resetPasswordWithoutCompanyDAO(emailExists.ul_id, hashedPassword);

        if (results) {
            // 🔥 Invalidate user lookup cache
            await deleteCache(CacheKeys.global.userLookup(email));
            res.status(200).json({ type: "success", message: "Password reset successfully" });
        } else {
            res.status(400).json({ type: "error", message: "Error resetting password" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ type: "error", message: "Error resetting password" });
    }
};