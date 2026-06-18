import { Request, Response } from "express";
import sendMail from "../lib/mail";
import { checkUserPermission } from "../middleware/middleware";
import { SessionUserType } from "../types";

export const sendEmailExport = async (request: Request, response: Response) => {
    // destructuring the request body
    const { email, subject, text, attachments, permission } = request.body;

    const user = request.user as SessionUserType | undefined;

    if (!user) {
        response.status(401).json({ type: "error", message: "Unauthorized" });
        return;
    }

    // Permission check
    if (!permission) {
        response.status(403).json({ type: "error", message: "Forbidden: No permission provided for export" });
        return;
    }

    const hasPermission = await checkUserPermission(user, permission);
    if (!hasPermission) {
        response.status(403).json({ type: "error", message: `Forbidden: Missing required permission [${permission}]` });
        return;
    }

    // if email is not provided
    if (!email) {
        response.status(400).json({ type: "error", message: "Email is required" });
        return;
    }

    // sending the email
    const sent = await sendMail(email, subject || "Data Export", text || "Please find the attached export.", attachments);

    // if email is sent successfully
    if (sent) {
        response.status(200).json({ type: "success", message: "Email sent successfully" });
    } else {
        response.status(500).json({ type: "error", message: "Failed to send email" });
    }
};