import { Request, Response } from "express";
import sendMail from "../lib/mail";
import { SELF_MAIL } from "../constants";
import { OTPManager } from "../otp";
import { NEWSLETTER_VERIFICATION_EMAIL } from "../templates/email-templates";
import { pool } from "../lib/db";

export const otpManager = new OTPManager();

export const submissionController = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, role, message, source } = req.body;

        // Log the submission for now
        console.log("New Website Submission:", { name, email, phone, role, message, source });

        const response = await sendMail(SELF_MAIL, "Website Contact Form Submission", `Source: ${source}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nRole: ${role}\nMessage: ${message}\nSource: ${source}`);
        if (response) {
            res.status(200).json({
                type: "success",
                message: "Your inquiry has been received. We will get back to you soon!"
            });
        } else {
            res.status(401).json({
                type: "error",
                message: "Your inquiry could not be registered. Please try again later!"
            });
        }
    } catch (error) {
        console.error("Submission Error:", error);
        res.status(500).json({
            type: "error",
            message: "Internal server error. Please try again later."
        });
    }
};

export const newsletterSubscribeController = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                type: "error",
                message: "Email is required!"
            });
        }

        const otp = otpManager.generateOTP(email, "newsletter");
        const mailContent = NEWSLETTER_VERIFICATION_EMAIL(otp);
        const response = await sendMail(email, "Newsletter Subscription Verification", mailContent);

        if (response) {
            res.status(200).json({
                type: "success",
                message: "A verification code has been sent to your email. Please verify to complete subscription."
            });
        } else {
            res.status(401).json({
                type: "error",
                message: "Failed to send verification email. Please try again later!"
            });
        }
    } catch (error) {
        console.error("Newsletter Subscription Error:", error);
        res.status(500).json({
            type: "error",
            message: "Internal server error. Please try again later."
        });
    }
};

export const newsletterVerifyController = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                type: "error",
                message: "Email and OTP are required!"
            });
        }

        const isValid = otpManager.verifyOTP(email, otp);
        if (!isValid) {
            return res.status(401).json({
                type: "error",
                message: "Invalid or expired OTP!"
            });
        }

        // Upsert into newsletter table
        await pool.query(
            `INSERT INTO newsletter (n_email, n_verified_yn) VALUES ($1, true)
             ON CONFLICT (n_email) DO UPDATE SET n_verified_yn = true`,
            [email]
        );

        otpManager.removeOTP(email);

        res.status(200).json({
            type: "success",
            message: "Subscription verified! Thank you for joining our newsletter."
        });
    } catch (error) {
        console.error("Newsletter Verification Error:", error);
        res.status(500).json({
            type: "error",
            message: "Internal server error. Please try again later."
        });
    }
};

export const newsletterUnsubscribeController = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                type: "error",
                message: "Email is required!"
            });
        }

        await pool.query(`DELETE FROM newsletter WHERE n_email = $1`, [email]);

        res.status(200).json({
            type: "success",
            message: "You have been successfully unsubscribed from our newsletter."
        });
    } catch (error) {
        console.error("Newsletter Unsubscribe Error:", error);
        res.status(500).json({
            type: "error",
            message: "Internal server error. Please try again later."
        });
    }
};