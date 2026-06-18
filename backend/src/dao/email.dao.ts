import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { UAParser } from "ua-parser-js";
import axios from "axios";
import {
    GENERAL_OTP_EMAIL,
    NEW_DEVICE_LOGIN_EMAIL,
    RESET_PASSWORD_EMAIL,
    OTPDetails,
    DeviceDetails,
    BILL_GENERATED_EMAIL,
    BillDetails,
    WELCOME_EMAIL,
    ONBOARDING_STATUS_EMAIL,
    OnboardingStatusDetails
} from "../templates/email-templates";
import { APP_NAME } from "../constants";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.GMAIL_TRANSPORTER_PASSWORD,
    },
});



export const sendOTPEmail = async (to: string, subject: string, details: OTPDetails) => {
    const html = GENERAL_OTP_EMAIL(details);

    const mailOptions = {
        from: `${APP_NAME} <${process.env.FROM_EMAIL}>`,
        to,
        subject,
        html,
        text: `Your OTP for ${details.purpose} is: ${details.otp}. Valid for 10 minutes.`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("OTP Email sent: " + info.response);
        return { type: "success", message: "Email sent successfully" };
    } catch (error) {
        console.error("Error sending email:", error);
        return { type: "error", message: "Failed to send email" };
    }
};

export const sendNewDeviceLoginEmail = async (to: string, details: DeviceDetails) => {
    try {
        const parser = new UAParser(details.userAgent);
        const result = parser.getResult();
        const os = result.os.name || "Unknown OS";
        const browser = result.browser.name || "Unknown Browser";

        // Fetch approximate location from IP
        let city = "";
        let country = "";

        if (details.ipAddress === "::1" || details.ipAddress === "127.0.0.1") {
            city = "Localhost";
            country = "Development";
        } else {
            try {
                const geoResponse = await axios.get(`http://ip-api.com/json/${details.ipAddress}`);
                if (geoResponse.data && geoResponse.data.status === "success") {
                    city = geoResponse.data.city || "";
                    country = geoResponse.data.country || "";
                }
            } catch (geoError) {
                console.error("Geolocation fetch error:", geoError);
            }
        }

        const locationParts = [];
        if (city && city !== "Unknown City") locationParts.push(city);
        if (country && country !== "Unknown Country") locationParts.push(country);
        const locationString = locationParts.length > 0 ? locationParts.join(", ") : "Location Unavailable";
        const detailLine = `${os} · ${browser} · ${locationString}`;

        // Date like "March 1 at 3:14 AM (IST)"
        const now = new Date();
        const month = now.toLocaleString('en-IN', { month: 'long', timeZone: 'Asia/Kolkata' });
        const day = now.toLocaleString('en-IN', { day: 'numeric', timeZone: 'Asia/Kolkata' });
        const time = now.toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
        const timestamp = `${month} ${day} at ${time} (IST)`;

        const html = NEW_DEVICE_LOGIN_EMAIL({
            appName: details.appName,
            userName: details.userName,
            detailLine,
            timestamp,
            to
        });

        const mailOptions = {
            from: `${details.appName} Security <${process.env.FROM_EMAIL}>`,
            to,
            subject: `Security Alert: New login on ${details.appName}`,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Instagram-style notification email sent: " + info.response);
        return { type: "success", data: [] };
    } catch (error) {
        console.error("Error sending new device login email:", error);
        return { type: "error", data: [] };
    }
};

export const sendSingleBillEmail = async (bill: any, pdfBuffer?: Buffer) => {
    if (!bill.email) return false;

    const billDetails: BillDetails = {
        companyName: bill.company_name,
        ownerName: bill.owner_name,
        flatNo: bill.flat_no,
        billNo: bill.bill_no,
        startDate: new Date(bill.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        endDate: new Date(bill.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        dueDate: new Date(bill.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        subTotal: Number(bill.sub_total),
        gst: Number(bill.gst),
        arrears: Number(bill.arrears),
        finalTotal: Number(bill.final_total),
        chargesBreakdown: bill.bill_details
    };

    const html = BILL_GENERATED_EMAIL(billDetails);

    const mailOptions: any = {
        from: `${bill.company_name} <${process.env.FROM_EMAIL}>`,
        to: bill.email,
        subject: `Maintenance Bill Generated - ${bill.bill_no} - Flat ${bill.flat_no}`,
        html,
        text: `Your maintenance bill for ${billDetails.startDate} to ${billDetails.endDate} has been generated. Amount Due: ₹${billDetails.finalTotal}. Due Date: ${billDetails.dueDate}.`,
    };

    if (pdfBuffer) {
        mailOptions.attachments = [
            {
                filename: `Maintenance_Bill_${bill.bill_no.replace(/\//g, '_')}.pdf`,
                content: pdfBuffer
            }
        ];
    }

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error(`Failed to send bill email to ${bill.email} for flat ${bill.flat_no}:`, error);
        return false;
    }
};

export const sendBulkBillEmails = async (bills: any[]) => {
    console.log(`Starting bulk bill email dispatch for ${bills.length} bills...`);

    let successCount = 0;
    let failCount = 0;

    for (const bill of bills) {
        const success = await sendSingleBillEmail(bill);
        if (success) successCount++;
        else failCount++;
    }

    console.log(`Bulk bill email dispatch completed. Success: ${successCount}, Failed: ${failCount}`);
    return { successCount, failCount };
};
export const sendResetPasswordEmail = async (to: string, details: { userName: string; resetLink: string; appName: string }) => {
    const html = RESET_PASSWORD_EMAIL(details);

    const mailOptions = {
        from: `GateKeeper Support <${process.env.FROM_EMAIL}>`,
        to,
        subject: `Reset Your Password - Gatekeeper ${details.appName}`,
        html,
        text: `Reset your password by clicking here: ${details.resetLink}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { type: "success" };
    } catch (error) {
        console.error("Error sending reset email:", error);
        return { success: false };
    }
};

export const sendWelcomeEmail = async (to: string, details: { companyName: string; continueLink: string }) => {
    const html = WELCOME_EMAIL(details);

    const mailOptions = {
        from: `${APP_NAME} Onboarding <${process.env.FROM_EMAIL}>`,
        to,
        subject: `Welcome to ${APP_NAME} - Let's Get Started!`,
        html,
        text: `Welcome to ${APP_NAME}, ${details.companyName}! Continue your onboarding here: ${details.continueLink}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Error sending welcome email:", error);
        return { success: false };
    }
};

export const sendOnboardingStatusEmail = async (to: string, details: OnboardingStatusDetails) => {
    const html = ONBOARDING_STATUS_EMAIL(details);

    const mailOptions = {
        from: `${APP_NAME} Onboarding <${process.env.FROM_EMAIL}>`,
        to,
        subject: `Onboarding Update: ${details.companyName}`,
        html,
        text: `Check your onboarding progress for ${details.companyName}.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Error sending onboarding status email:", error);
        return { success: false };
    }
};
