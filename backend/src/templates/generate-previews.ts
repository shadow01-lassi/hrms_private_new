import {
    CREATE_COMPANY_VERIFICATION_EMAIL,
    GENERAL_OTP_EMAIL,
    NEW_DEVICE_LOGIN_EMAIL,
    RESET_PASSWORD_EMAIL,
    BILL_GENERATED_EMAIL,
    WELCOME_EMAIL,
    ONBOARDING_STATUS_EMAIL,
    BillDetails,
    OnboardingStatusDetails
} from "./email-templates";
import * as fs from "fs";
import * as path from "path";

const dummyBill: BillDetails = {
    companyName: "Palm Beach Residency",
    ownerName: "John Doe",
    flatNo: "A-101",
    billNo: "PBR/2024/001",
    startDate: "01 Apr 2024",
    endDate: "30 Jun 2024",
    dueDate: "15 Jul 2024",
    subTotal: 4500,
    gst: 810,
    arrears: 0,
    finalTotal: 5310,
    chargesBreakdown: [
        { bill_head: "Maintenance", bill_value: "4000" },
        { bill_head: "Sinking Fund", bill_value: "500" }
    ]
};

const dummyOnboarding: OnboardingStatusDetails = {
    companyName: "Palm Beach Residency",
    continueLink: "https://conversational-ai.valueye.in/onboard",
    steps: [
        { stepNumber: 1, status: 'completed' },
        { stepNumber: 2, status: 'completed' },
        { stepNumber: 3, status: 'current' },
        { stepNumber: 4, status: 'pending' },
        { stepNumber: 5, status: 'pending' },
        { stepNumber: 6, status: 'pending' },
        { stepNumber: 7, status: 'pending' },
        { stepNumber: 8, status: 'pending' }
    ]
};

const previews = [
    { name: "1. Create Company Verification", html: CREATE_COMPANY_VERIFICATION_EMAIL("123456") },
    {
        name: "2. General OTP", html: GENERAL_OTP_EMAIL({
            appName: "Conversational AI",
            userName: "John Doe",
            otp: "654321",
            purpose: "login"
        })
    },
    {
        name: "3. New Device Login", html: NEW_DEVICE_LOGIN_EMAIL({
            appName: "Conversational AI",
            userName: "John Doe",
            detailLine: "Chrome on MacOS · Mumbai, India",
            timestamp: new Date().toLocaleString(),
            to: "john@example.com"
        })
    },
    {
        name: "4. Reset Password", html: RESET_PASSWORD_EMAIL({
            appName: "Conversational AI",
            userName: "John Doe",
            resetLink: "https://conversational-ai.valueye.in/reset-password?token=xyz"
        })
    },
    { name: "5. Bill Generated", html: BILL_GENERATED_EMAIL(dummyBill) },
    {
        name: "6. Welcome to Conversational AI", html: WELCOME_EMAIL({
            companyName: "Palm Beach Residency",
            continueLink: "https://conversational-ai.valueye.in/onboard"
        })
    },
    { name: "7. Onboarding Status", html: ONBOARDING_STATUS_EMAIL(dummyOnboarding) }
];

const fullHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Email Templates Preview</title>
    <style>
        body { background: #f5f5f7; margin: 0; padding: 20px; font-family: sans-serif; }
        .preview-section { margin-bottom: 60px; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .preview-header { background: #000; color: #fff; padding: 15px 25px; font-weight: bold; font-size: 18px; }
        .preview-content { padding: 20px; background: #eee; display: flex; justify-content: center; }
        iframe { border: none; width: 100%; height: 800px; background: #fff; border-radius: 8px; }
        .sidebar { position: fixed; left: 20px; top: 20px; width: 250px; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .sidebar a { display: block; padding: 10px; color: #333; text-decoration: none; border-radius: 6px; margin-bottom: 5px; font-size: 14px; }
        .sidebar a:hover { background: #f0f0f0; }
        .main-content { margin-left: 300px; }
    </style>
</head>
<body>
    <div class="sidebar">
        <h3 style="margin-top:0">Templates</h3>
        ${previews.map((p, i) => `<a href="#template-${i}">${p.name}</a>`).join('')}
    </div>
    <div class="main-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 16px;">
            <h1 style="margin:0">Email Templates Preview</h1>
            <div style="font-size: 12px; color: #666; background: #f0f0f0; padding: 4px 12px; border-radius: 12px;">
                Last Updated: ${new Date().toLocaleString()}
            </div>
        </div>
        ${previews.map((p, i) => `
            <div id="template-${i}" class="preview-section">
                <div class="preview-header">${p.name}</div>
                <div class="preview-content">
                    <iframe srcdoc="${p.html.replace(/"/g, '&quot;')}" sandbox="allow-same-origin"></iframe>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, "preview.html"), fullHtml);
console.log("Preview file generated successfully.");
