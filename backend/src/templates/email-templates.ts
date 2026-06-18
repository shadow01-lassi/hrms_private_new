import { ADDRESS, APP_NAME, COPYRIGHTS, WEBSITE_URL } from "../constants";

const SHARED_CSS = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #18181b; margin: 0; padding: 0; background-color: #f4f4f5; -webkit-font-smoothing: antialiased; }
    .wrapper { padding: 32px 16px; }
    .container { max-width: 380px; margin: 0 auto; padding: 24px; border-radius: 12px; background-color: #ffffff; border: 1px solid #e4e4e7; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .header { margin-bottom: 24px; display: table; width: 100%; }
    .logo { display: table-cell; font-size: 15px; font-weight: 700; color: #09090b; letter-spacing: -0.5px; vertical-align: middle; text-transform: uppercase; }
    .badge-wrap { display: table-cell; text-align: right; vertical-align: middle; }
    .badge { padding: 4px 8px; background-color: #f4f4f5; color: #52525b; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .title { font-size: 18px; font-weight: 600; color: #09090b; margin: 0 0 6px 0; letter-spacing: -0.5px; }
    .text { font-size: 13px; color: #52525b; margin-bottom: 20px; line-height: 1.5; }
    .otp-box { background: #fafafa; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px; border: 1px dashed #d4d4d8; }
    .otp-code { font-size: 24px; font-weight: 600; color: #09090b; letter-spacing: 6px; font-family: 'SF Mono', 'Roboto Mono', monospace; white-space: nowrap; margin-left: 6px; }
    .validity { font-size: 11px; color: #71717a; margin-top: 6px; font-weight: 500; }
    .button { display: block; box-sizing: border-box; padding: 12px 20px; background-color: #09090b; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 13px; text-align: center; margin-top: 8px; }
    .info-box { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
    .info-row { display: table; width: 100%; margin-bottom: 8px; font-size: 12px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { display: table-cell; color: #71717a; text-align: left; }
    .info-value { display: table-cell; color: #18181b; font-weight: 500; text-align: right; }
    .footer { 
        margin-top: 16px; 
        padding: 40px 32px; 
        background-color: #f9fafb; 
        border-radius: 24px; 
        text-align: center; 
    }
    .footer-text { font-size: 11px; color: #6b7280; margin: 0; line-height: 1.6; }
    .footer-link { color: #111827; text-decoration: none; font-weight: 700; font-size: 11px; }
`;

const generateFooter = (appName: string = APP_NAME) => `
    <div class="footer">
        <p class="footer-text" style="margin-bottom: 24px;">
            ${appName.toUpperCase()}
        </p>
        <p class="footer-text" style="margin-bottom: 8px;">
            To update your communication settings or to unsubscribe, use the links below.
        </p>
        <p class="footer-text" style="margin-bottom: 24px;">
            <a target="_blank" href="${WEBSITE_URL}/dashboard/preferences?subscribe=true" class="footer-link">Manage Preferences</a>
            &nbsp;|&nbsp;
            <a target="_blank" href="${WEBSITE_URL}/dashboard/preferences?subscribe=false" class="footer-link">Unsubscribe</a>
        </p>
        <p class="footer-text" style="color: #9ca3af; font-size: 10px;">
            &copy; ${new Date().getFullYear()} ${COPYRIGHTS}. All rights reserved.
        </p>
    </div>
`;

export const CREATE_COMPANY_VERIFICATION_EMAIL = (otp: string) => `
    <!DOCTYPE html>
    <html>
    <head><style>${SHARED_CSS}</style></head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <div class="logo">${APP_NAME.toUpperCase()}</div>
                    <div class="badge-wrap"><span class="badge">Verification</span></div>
                </div>
                <h1 class="title">Verify email</h1>
                <p class="text">Use the authorization code below to finalize your society registration.</p>
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                    <div class="validity">Valid for 10 minutes</div>
                </div>
                ${generateFooter()}
            </div>
        </div>
    </body>
    </html>
`;

export const RESET_PASSWORD_OTP_VERIFICATION_EMAIL = (username: string, otp: string, email: string) => `
    <!DOCTYPE html>
    <html>
    <head><style>${SHARED_CSS}</style></head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <div class="logo">${APP_NAME.toUpperCase()}</div>
                    <div class="badge-wrap"><span class="badge" style="background:#fef2f2; color:#b91c1c;">Security</span></div>
                </div>
                <h1 class="title">Reset Request</h1>
                <p class="text">Hi <strong>${username}</strong>,<br>We received a request to reset your password. Use the code below to proceed.</p>
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                    <div class="validity">Valid for 15 minutes</div>
                </div>
                <p class="text" style="font-size: 11px; color: #a1a1aa; margin-bottom: 0;">Sent to <a target="_blank" href="mailto:${email}" style="color: #71717a;">${email}</a>. If this wasn't you, please secure your account immediately.</p>
                ${generateFooter()}
            </div>
        </div>
    </body>
    </html>
`;

export const NEWSLETTER_VERIFICATION_EMAIL = (otp: string) => `
    <!DOCTYPE html>
    <html>
    <head><style>${SHARED_CSS}</style></head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <div class="logo">${APP_NAME.toUpperCase()}</div>
                    <div class="badge-wrap"><span class="badge">Newsletter</span></div>
                </div>
                <h1 class="title">Confirm Subscription</h1>
                <p class="text">Please use the 6-digit code below to verify your email address.</p>
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                    <div class="validity">Valid for 10 minutes</div>
                </div>
                ${generateFooter()}
            </div>
        </div>
    </body>
    </html>
`;

export interface OTPDetails {
    appName: string;
    userName: string;
    otp: string;
    purpose: string;
    ipAddress?: string;
}

export interface DeviceDetails {
    userName: string;
    deviceName: string;
    userAgent: string;
    ipAddress: string;
    appName: string;
}

export interface BillDetails {
    companyName: string;
    ownerName: string;
    flatNo: string;
    billNo: string;
    startDate: string;
    endDate: string;
    dueDate: string;
    subTotal: number;
    gst: number;
    arrears: number;
    finalTotal: number;
    chargesBreakdown: { bill_head: string; bill_value: string }[];
}

export interface OnboardingStep {
    stepNumber: number;
    status: 'completed' | 'verifying' | 'current' | 'pending';
}

export interface OnboardingStatusDetails {
    companyName: string;
    steps: OnboardingStep[];
    continueLink: string;
}

export const GENERAL_OTP_EMAIL = (details: OTPDetails) => `
    <!DOCTYPE html>
    <html>
    <head><style>${SHARED_CSS}</style></head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <div class="logo">${details.appName}</div>
                    <div class="badge-wrap"><span class="badge">Auth</span></div>
                </div>
                <h1 class="title">Verification</h1>
                <p class="text">Hi <strong>${details.userName}</strong>,<br>Use the code below for <strong>${details.purpose}</strong>.</p>
                <div class="otp-box">
                    <div class="otp-code">${details.otp}</div>
                    <div class="validity">Expires in 10m</div>
                </div>
                ${generateFooter(details.appName)}
            </div>
        </div>
    </body>
    </html>
`;

export const NEW_DEVICE_LOGIN_EMAIL = (details: { appName: string; userName: string; detailLine: string; timestamp: string; to: string }) => `
    <!DOCTYPE html>
    <html>
    <head><style>${SHARED_CSS}</style></head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <div class="logo">${details.appName}</div>
                    <div class="badge-wrap"><span class="badge" style="background:#fef2f2; color:#b91c1c;">Alert</span></div>
                </div>
                <h1 class="title">New Login Detected</h1>
                <p class="text">Hi <strong>${details.userName}</strong>,<br>We noticed a login to your account from a new device.</p>
                <div class="info-box">
                    <div class="info-row"><div class="info-label">Device</div><div class="info-value">${details.detailLine}</div></div>
                    <div class="info-row"><div class="info-label">Time</div><div class="info-value">${details.timestamp}</div></div>
                </div>
                <p class="text" style="font-size: 12px; margin-bottom: 24px;">If this was you, you can safely ignore this email.</p>
                <a target="_blank" href="${WEBSITE_URL}/support" class="button">Secure Account</a>
                ${generateFooter(details.appName)}
            </div>
        </div>
    </body>
    </html>
`;

export const RESET_PASSWORD_EMAIL = (details: { appName: string; userName: string; resetLink: string }) => `
    <!DOCTYPE html>
    <html>
    <head><style>${SHARED_CSS}</style></head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <div class="logo">${details.appName}</div>
                </div>
                <h1 class="title">Reset Password</h1>
                <p class="text">Hi <strong>${details.userName}</strong>,<br>Click the button below to choose a new password. This link expires in 15 minutes.</p>
                <a target="_blank" href="${details.resetLink}" class="button">Reset Password</a>
                ${generateFooter(details.appName)}
            </div>
        </div>
    </body>
    </html>
`;

export const BILL_GENERATED_EMAIL = (details: BillDetails) => `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            ${SHARED_CSS}
            .bill-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            .bill-th { text-align: left; font-size: 10px; color: #71717a; text-transform: uppercase; padding: 8px 0; border-bottom: 1px solid #e4e4e7; }
            .bill-td { padding: 10px 0; border-bottom: 1px solid #f4f4f5; font-size: 12px; color: #18181b; }
            .bill-amount { text-align: right; font-weight: 500; }
            .total-row { display: table; width: 100%; font-size: 12px; margin-bottom: 6px; }
            .total-label { display: table-cell; color: #71717a; }
            .total-value { display: table-cell; text-align: right; font-weight: 500; color: #18181b; }
            .total-final { margin-top: 8px; padding-top: 8px; border-top: 1px solid #e4e4e7; font-size: 14px; font-weight: 600; color: #09090b; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <div class="logo">${details.companyName}</div>
                    <div class="badge-wrap"><span class="badge">Invoice</span></div>
                </div>
                <h1 class="title">Statement</h1>
                <p class="text" style="font-size: 12px;">Ref: ${details.billNo} &middot; Due: <strong>${details.dueDate}</strong></p>
                
                <div class="info-box" style="padding: 12px 16px;">
                    <div class="info-row"><div class="info-label">To</div><div class="info-value">${details.ownerName}</div></div>
                    <div class="info-row"><div class="info-label">Flat</div><div class="info-value">${details.flatNo}</div></div>
                </div>

                <table class="bill-table">
                    <thead><tr><th class="bill-th">Description</th><th class="bill-th" style="text-align: right;">Amount</th></tr></thead>
                    <tbody>
                        ${details.chargesBreakdown.map(charge => `
                            <tr>
                                <td class="bill-td">${charge.bill_head}</td>
                                <td class="bill-td bill-amount">₹${Number(charge.bill_value).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="background: #fafafa; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <div class="total-row"><div class="total-label">Subtotal</div><div class="total-value">₹${details.subTotal.toFixed(2)}</div></div>
                    ${details.gst > 0 ? `<div class="total-row"><div class="total-label">Tax</div><div class="total-value">₹${details.gst.toFixed(2)}</div></div>` : ''}
                    ${details.arrears > 0 ? `<div class="total-row"><div class="total-label">Arrears</div><div class="total-value">₹${details.arrears.toFixed(2)}</div></div>` : ''}
                    <div class="total-row total-final"><div class="total-label" style="color: #09090b;">Total Due</div><div class="total-value">₹${details.finalTotal.toFixed(2)}</div></div>
                </div>

                <p class="text" style="font-size: 11px; text-align: center; margin: 0;">Please pay by the due date to avoid late fees.</p>
                ${generateFooter(details.companyName)}
            </div>
        </div>
    </body>
    </html>
`;

export const WELCOME_EMAIL = (details: { companyName: string; continueLink: string }) => {
    return `
    <!DOCTYPE html>
    <html>
    <head><style>${SHARED_CSS}</style></head>
    <body>
        <div class="wrapper">
            <div class="container" style="text-align: center;">
                <h1 class="title" style="font-size: 20px;">Welcome to ${APP_NAME}</h1>
                <p class="text">Your workspace for <strong>${APP_NAME}</strong> is ready to be configured.</p>
                
                <a target="_blank" href="${details.continueLink}" class="button">Continue Onboarding</a>
                ${generateFooter()}
            </div>
        </div>
    </body>
    </html>
    `;
};

export const ONBOARDING_STATUS_EMAIL = (details: OnboardingStatusDetails) => {
    const stepLabels: { [key: number]: string } = {
        1: "Society Verification",
        2: "Basic Details",
        3: "Units & Wings",
        4: "Committee Setup",
        5: "Finance Config",
        6: "Resident Import",
        7: "Amenities",
        8: "Go Live"
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            ${SHARED_CSS}
            .status-container { margin: 32px 0; }
            .step { display: table; width: 100%; border-spacing: 0; margin-bottom: 0; }
            .step-icon-cell { display: table-cell; width: 20px; vertical-align: top; position: relative; padding-bottom: 24px; }
            .step-content-cell { display: table-cell; vertical-align: top; padding-left: 20px; padding-bottom: 24px; }
            
            .dot { width: 10px; height: 10px; border-radius: 50%; display: block; z-index: 2; position: relative; margin-top: 4px; }
            .dot-completed { background-color: #09090b; }
            .dot-current { background-color: #ffffff; border: 2.5px solid #09090b; width: 6px; height: 6px; }
            .dot-pending { background-color: #e4e4e7; }
            
            .line { position: absolute; left: 4px; top: 14px; bottom: -4px; width: 2px; background-color: #f4f4f5; z-index: 1; }
            .line-active { background-color: #09090b; }
            .step:last-child .line { display: none; }
            
            .step-title { font-size: 14px; font-weight: 600; color: #09090b; margin: 0 0 2px 0; letter-spacing: -0.3px; }
            .step-meta { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
            .status-completed { color: #09090b; }
            .status-current { color: #71717a; }
            .status-pending { color: #a1a1aa; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <div class="logo">${APP_NAME.toUpperCase()}</div>
                    <div class="badge-wrap"><span class="badge">Onboarding</span></div>
                </div>
                <h1 class="title">Sync Status</h1>
                <p class="text">Onboarding progress for <strong>${details.companyName}</strong>.</p>
                
                <div class="status-container">
                    ${details.steps.map((step, index) => {
        const isLast = index === details.steps.length - 1;
        const isCompleted = step.status === 'completed';
        // const isCurrent = step.status === 'current';
        return `
            <div class="step">
                <div class="step-icon-cell">
                    <div class="dot dot-${step.status}"></div>
                    ${!isLast ? `<div class="line ${isCompleted ? 'line-active' : ''}"></div>` : ''}
                </div>
                <div class="step-content-cell">
                    <p class="step-title">${stepLabels[step.stepNumber]}</p>
                    <span class="step-meta status-${step.status}">${step.status}</span>
                </div>
            </div>
            `;
    }).join('')}
                </div>
                
                <a target="_blank" href="${details.continueLink}" class="button" style="margin-top: 8px;">Resume Deployment</a>
                ${generateFooter(details.companyName)}
            </div>
        </div>
    </body>
    </html>
    `;
}