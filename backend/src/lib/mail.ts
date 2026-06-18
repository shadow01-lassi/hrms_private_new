import nodemailer from "nodemailer";
import { config } from "dotenv";
import { APP_NAME } from "../constants";

config();

type SendMailFunction = (email: string, subject: string, text: string, attachments?: { filename: string, content: any }[]) => Promise<boolean>;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.GMAIL_TRANSPORTER_PASSWORD, // Use the generated App Password
    },
});

const sendMail: SendMailFunction = async (email, subject, text, attachments = [], app_name?: string,) => {
    // decide which app name to print
    const appName = app_name && app_name?.length > 0 ? app_name : APP_NAME;

    const mailOptions = {
        from: `"${appName}" <${process.env.FROM_EMAIL}>`,
        to: email,
        replyTo: process.env.FROM_EMAIL, // Helps with spam filters
        subject: subject,
        text: text.replace(/<[^>]*>?/gm, ''), // Plaintext fallback reduces spam score
        html: text,
        attachments: attachments,
        headers: {
            "X-Priority": "1 (Highest)", // Mark as important for OTPs
            "X-Mailer": "Nodemailer",
        }
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

export default sendMail;
