import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import sendMail from "../lib/mail";
import { OTPManager } from "../otp";
import * as comp_dao from "../dao/company.dao";
import * as master_dao from "../dao/master.dao";
import * as onboard_dao from "../dao/onboard.dao";
import * as email_dao from "../dao/email.dao";
import * as user_dao from "../dao/user.dao";
import { pool } from "../lib/db";
import { CREATE_COMPANY_VERIFICATION_EMAIL } from "../templates/email-templates";
import { WEBSITE_URL } from "../constants";

export const otpManager = new OTPManager();

const getCompanyId = (request: Request): number => {
    // 1. Check query param
    const queryCompany = request.query.company;
    let companyId = Number(Array.isArray(queryCompany) ? queryCompany[0] : queryCompany);

    // 2. If not in query, check onboarding token
    if (!companyId || isNaN(companyId)) {
        const token = request.headers["x-onboarding-token"] as string;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
            companyId = decoded.cm_id;
        }
    }

    return companyId;
};

// STEP 1: CREATE COMPANY IF NOT EXSITS AND SEND OTP
export const createCompanyController = async (request: Request, response: Response): Promise<void> => {
    const { name, email } = request.body;

    if (!email) {
        response.status(400).json({ type: "error", message: "Email is required" });
        return;
    }

    let result = {};
    let already_exists = false;

    // check if email exists
    const emailCheck = await comp_dao.getOnboardingCompanyByEmailDAO(email);

    if (emailCheck && emailCheck.length > 0) {
        // Society already exists for this email
        result = emailCheck[0];
        already_exists = true;
    } else {
        // New society
        if (!name) {
            // Need society name first
            response.status(200).json({
                type: "success",
                message: "Email checked",
                data: { already_exists: false, name_required: true }
            });
            return;
        }
        // Have name and email, create the record
        result = await comp_dao.createCompanyDAO(name, email);
    }

    // Use email as key for OTP store
    const otp = otpManager.generateOTP(email, email);
    const emailBody = CREATE_COMPANY_VERIFICATION_EMAIL(otp);
    const emailResults = await sendMail(email, "OTP", emailBody);

    if (emailResults) {
        response.status(200).json({
            type: "success",
            message: "OTP sent successfully!",
            data: { result, already_exists }
        });
    } else {
        response.status(400).json({ type: "error", message: "Failed to send OTP" });
    }
}

// STEP 1: VERIFY OTP AND CREATE TOKEN FOR ONBOARDING LOGIN FOR COMPANY
export const verifyOTPController = async (request: Request, response: Response): Promise<void> => {
    const { email, otp } = request.body;
    const result = await otpManager.verifyOTP(email, otp);
    if (result) {
        const companies = await comp_dao.getCompanyByEmailDAO(email);
        if (companies && companies.length > 0) {
            const company = companies[0];
            const platform = request.clientId || "ADMIN_APP";

            const token = jwt.sign(
                {
                    cm_id: company.cm_id,
                    cm_name: company.cm_name,
                    cm_email: company.cm_email,
                    clientId: platform
                },
                process.env.JWT_SECRET as string,
                {
                    expiresIn: "24 hours",
                    audience: platform
                }
            );

            response.status(200).json({
                type: "success",
                message: "OTP verified successfully",
                token: token,
                data: {
                    id: company.cm_id,
                    name: company.cm_name,
                    email: company.cm_email
                }
            });

            // Send Welcome Email after Step 1 is finalized
            email_dao.sendWelcomeEmail(company.cm_email, {
                companyName: company.cm_name,
                continueLink: `${WEBSITE_URL}/onboard`
            }).catch(err => console.error("Welcome email error:", err));
        } else {
            response.status(404).json({ type: "error", message: "Society not found" });
        }
    } else {
        response.status(400).json({ type: "error", message: "Failed to verify OTP" });
    }
}

const sendStepStatusEmail = async (cm_id: number) => {
    try {
        const progress = await onboard_dao.getOnboardingProgressDAO(cm_id);
        const company = await onboard_dao.getCompanyDAO(cm_id);
        if (company && company.cm_email) {
            await email_dao.sendOnboardingStatusEmail(company.cm_email, {
                companyName: company.cm_name,
                steps: progress,
                continueLink: `${WEBSITE_URL}/onboard`
            });
        }
    } catch (error) {
        console.error("Error sending onboarding status email:", error);
    }
}

// STEP 2: UPDATE COMPANY DETAILS
export const updateCompanyDetailsController = async (request: Request, response: Response): Promise<void> => {
    try {
        const {
            cm_id,
            cm_name,
            cm_registration_no,
            cm_pan_no,
            cm_gstin_no,
            cm_logo,
            account_holder_name,
            account_number,
            ifsc,
            account_type,
            bank_name,
            branch,
            upi_id
        } = request.body;

        if (!cm_id || !cm_name || !cm_registration_no) {
            response.status(400).json({
                type: "error",
                message: "Society ID, Name, or Registration Number is missing."
            });
            return;
        }

        const cm_branch_name = [bank_name, branch].filter(Boolean).join(", ");

        const result = await comp_dao.updateCompanyRegistrationDetailsDAO(
            Number(cm_id),
            cm_name,
            cm_registration_no,
            cm_pan_no,
            cm_gstin_no,
            cm_logo,
            account_holder_name,
            account_number,
            ifsc,
            account_type,
            cm_branch_name,
            upi_id
        );

        if (result) {
            response.status(200).json({
                type: "success",
                message: "Society details updated successfully!",
                data: result
            });

            // Trigger status email
            sendStepStatusEmail(Number(cm_id));
        } else {
            response.status(500).json({
                type: "error",
                message: "Failed to update society details."
            });
        }
    } catch (error: any) {
        console.error("Error in updateCompanyDetailsController:", error);

        // Handle PostgreSQL unique constraint violations (Error Code: 23505)
        if (error.code === "23505") {
            let detailMessage = "A society with these registration details already exists.";

            if (error.constraint && error.constraint.includes("cm_registration_no")) {
                detailMessage = "This Registration Number is already registered in our system.";
            } else if (error.constraint && error.constraint.includes("cm_pan_no")) {
                detailMessage = "This PAN number is already associated with another society.";
            } else if (error.constraint && error.constraint.includes("cm_gstin_no")) {
                detailMessage = "This GSTIN is already associated with another society.";
            }

            response.status(400).json({
                type: "error",
                message: detailMessage
            });
            return;
        }

        response.status(500).json({
            type: "error",
            message: error.message || "Internal server error"
        });
    }
};

// STEP 2: GET SOCIETY DETAILS
export const getOnboardingStep2Controller = async (request: Request, response: Response): Promise<void> => {
    const companyId = getCompanyId(request);
    if (!companyId || isNaN(companyId)) {
        response.status(400).json({ type: "error", message: "Company ID is required" });
        return;
    }

    const society = await comp_dao.getCompanyByIdDAO(companyId);
    if (!society) {
        response.status(404).json({ type: "error", message: "Society not found" });
        return;
    }

    response.status(200).json({
        type: "success",
        message: "Society registration details fetched successfully",
        data: society
    });
};

// STEP 4: CREATE/SYNC ADMIN LOGINS
export const onboardAdminLoginsController = async (request: Request, response: Response): Promise<void> => {
    try {
        const companyId = getCompanyId(request);
        const { admins } = request.body;

        if (!companyId || isNaN(companyId)) {
            response.status(400).json({ type: "error", message: "Company ID is required" });
            return;
        }

        if (!admins || !Array.isArray(admins) || admins.length === 0) {
            response.status(400).json({ type: "error", message: "Admin details are required" });
            return;
        }

        const syncResult = await user_dao.syncSocietyAdminsDAO(companyId, admins);

        if (syncResult.status === "success") {
            response.status(200).json({
                type: "success",
                message: syncResult.message,
                data: syncResult
            });

            // Trigger status email
            sendStepStatusEmail(companyId);
        } else {
            response.status(400).json({
                type: "error",
                message: syncResult.message,
                data: syncResult
            });
        }
    } catch (error: any) {
        console.error("Error in onboardAdminLoginsController:", error);

        // Handle PostgreSQL unique constraint violations (Error Code: 23505)
        if (error.code === "23505") {
            let detailMessage = "An account with these details already exists.";

            if (error.constraint === "employee_login_el_email_unique" || error.constraint?.includes("el_email")) {
                detailMessage = "One of the emails you entered is already registered. Please use a unique email.";
            } else if (error.constraint === "employee_login_el_mobile_unique" || error.constraint?.includes("el_mobile")) {
                detailMessage = "One of the mobile numbers you entered is already registered.";
            } else if (error.constraint === "unique_login_username_per_company" || error.constraint?.includes("el_username")) {
                detailMessage = "One of the usernames you entered is already taken.";
            }

            response.status(400).json({
                type: "error",
                message: detailMessage
            });
            return;
        }

        response.status(500).json({
            type: "error",
            message: error.message || "Internal server error"
        });
    }
};

export const getOnboardingStep4Controller = async (request: Request, response: Response): Promise<void> => {
    const companyId = getCompanyId(request);
    if (!companyId || isNaN(companyId)) {
        response.status(400).json({ type: "error", message: "Company ID is required" });
        return;
    }

    const admins = await user_dao.getSocietyAdminsDAO(companyId);
    response.status(200).json({
        type: "success",
        message: "Admins fetched successfully",
        data: admins
    });
};

export const getOnboardingStatusController = async (request: Request, response: Response): Promise<void> => {
    const token = request.headers["x-onboarding-token"] as string;
    if (!token) {
        response.status(401).json({ type: "error", message: "Onboarding session expired" });
        return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const cm_id = decoded.cm_id;

    const progress = await onboard_dao.getOnboardingProgressDAO(cm_id);

    response.status(200).json({
        type: "success",
        message: "Onboarding status fetched successfully",
        data: progress
    });
};

export const applyForVerificationController = async (request: Request, response: Response): Promise<void> => {
    const companyId = getCompanyId(request);

    const result = await comp_dao.updateCompanyGoAheadDAO(companyId);

    // Trigger status email for final verification step
    sendStepStatusEmail(companyId);

    response.json({
        type: "success",
        message: "Applied for verification",
        data: result
    });
};

// UNIQUENESS CHECKS FOR STEP 4
export const checkUsernameController = async (request: Request, response: Response): Promise<void> => {
    const { username, excludeId } = request.query;
    if (!username) {
        response.status(400).json({ type: "error", message: "Username is required" });
        return;
    }
    const exists = await user_dao.checkUsernameAvailabilityDAO(String(username), excludeId ? Number(excludeId) : undefined);
    response.json({ type: "success", available: !exists });
};

export const checkEmailController = async (request: Request, response: Response): Promise<void> => {
    const { email, excludeId } = request.query;
    if (!email) {
        response.status(400).json({ type: "error", message: "Email is required" });
        return;
    }
    const exists = await user_dao.checkEmailAvailabilityDAO(String(email), excludeId ? Number(excludeId) : undefined);
    response.json({ type: "success", available: !exists });
};

export const checkMobileController = async (request: Request, response: Response): Promise<void> => {
    const { mobile, excludeId } = request.query;
    if (!mobile) {
        response.status(400).json({ type: "error", message: "Mobile is required" });
        return;
    }
    const exists = await user_dao.checkMobileAvailabilityDAO(String(mobile), excludeId ? Number(excludeId) : undefined);
    response.json({ type: "success", available: !exists });
};

// UNIQUENESS CHECKS FOR STEP 2
export const checkRegistrationController = async (request: Request, response: Response): Promise<void> => {
    const { registration, excludeId } = request.query;
    if (!registration) {
        response.status(400).json({ type: "error", message: "Registration number is required" });
        return;
    }
    const exists = await comp_dao.checkRegistrationAvailabilityDAO(String(registration), excludeId ? Number(excludeId) : undefined);
    response.json({ type: "success", available: !exists });
};

export const checkPanController = async (request: Request, response: Response): Promise<void> => {
    const { pan, excludeId } = request.query;
    if (!pan) {
        response.status(400).json({ type: "error", message: "PAN is required" });
        return;
    }
    const exists = await comp_dao.checkPanAvailabilityDAO(String(pan), excludeId ? Number(excludeId) : undefined);
    response.json({ type: "success", available: !exists });
};

export const checkGSTINController = async (request: Request, response: Response): Promise<void> => {
    const { gstin, excludeId } = request.query;
    if (!gstin) {
        response.status(400).json({ type: "error", message: "GSTIN is required" });
        return;
    }
    const exists = await comp_dao.checkGSTINAvailabilityDAO(String(gstin), excludeId ? Number(excludeId) : undefined);
    response.json({ type: "success", available: !exists });
};
