import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";

// caching
import { CacheKeys } from "../lib/cacheKeys";

// importing dao functions
import * as user_dao from "../dao/user.dao";
import * as perm_dao from "../dao/permission.dao";
import { otpManager } from "./password.controller";
import { bruteForceService } from "../utils/bruteForce";
import { tokenService } from "../utils/token";
import * as email_dao from "../dao/email.dao";

import { DEFAULT_PASSWORD } from "../constants";
import { deleteCache, deleteByPattern, getOrSetCache, TTL } from "../lib/cache";

export const signupUser = async (request: Request, response: Response): Promise<void> => {
    console.log(request.body);
    response.status(200).json({ type: "success", message: "User created successfully" });
};

enum ClientApp {
    ADMIN = "ADMIN_APP",
    MEMBER = "MEMBER_APP",
    GUARD = "GUARD_APP",
    DEVELOPER = "DEVELOPER_APP"
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        let { username } = req.body;
        const { password } = req.body;
        if (username) username = username.toString().trim().toLowerCase();
        if (!username || !password) {
            res.status(400).json({ type: "error", message: "Username and password are required" });
            return;
        }
        const user = await user_dao.getUserByEmailOrMobile(username);
        if (!user) {
            await bruteForceService.registerFail(username, req.ip || "unknown");
            res.status(401).json({ type: "error", message: "Incorrect credentials!" });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.el_password);
        if (!isMatch) {
            await bruteForceService.registerFail(username, req.ip || "unknown");
            res.status(401).json({ type: "error", message: "Incorrect credentials!" });
            return;
        }
        await bruteForceService.reset(username, req.ip || "unknown");
        const accessToken = tokenService.generateAccessToken({
            id: user.el_id,
            name: user.el_name,
            email: '',
            mobile: '',
            role: user.el_role,
            societyId: 0,
            accessType: 'AD'
        }, req.clientId);
        const refreshToken = await tokenService.generateRefreshToken({
            id: user.el_id,
            name: user.el_name,
            email: '',
            mobile: '',
            role: user.el_role,
            societyId: 0,
            accessType: 'AD',
            clientId: req.clientId
        }, "web");
        await user_dao.updateUserLastLoggedIn(user.el_id);
        res.status(200).json({
            type: "success",
            message: "Login successful",
            accessToken,
            refreshToken,
            data: {
                id: user.el_id,
                name: user.el_name,
                flatNo: '',
                societyId: 0,
                role: user.el_role,
                accessType: 'AD',
                permissions: []
            }
        });
    } catch (error) {
        console.error("Login controller error:", error);
        res.status(500).json({ type: "error", message: "Login failed" });
    }
};

export const registerUserController = async (req: Request, res: Response): Promise<void> => {
    try {
        let { name, email, mobile } = req.body;
        const { password, role } = req.body;

        if (email) email = email.toString().trim().toLowerCase();
        if (mobile) mobile = mobile.toString().trim();
        if (name) name = name.toString().trim();

        // 1. Validation
        if (!name || !email || !mobile || !password || !role) {
            res.status(400).json({ type: "error", message: "All fields are required" });
            return;
        }

        // Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ type: "error", message: "Invalid email format" });
            return;
        }

        // Mobile format check (at least 10 digits)
        if (mobile.length < 10) {
            res.status(400).json({ type: "error", message: "Mobile number must be at least 10 digits" });
            return;
        }

        // Password complexity (at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/;
        if (!passwordRegex.test(password)) {
            res.status(400).json({ 
                type: "error", 
                message: "Password must be 8-32 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." 
            });
            return;
        }

        // Validate role
        const allowedRoles = ["Admin", "Employee", "Manager"];
        if (!allowedRoles.includes(role)) {
            res.status(400).json({ type: "error", message: "Invalid role value" });
            return;
        }

        // Check duplicates
        const emailExists = await user_dao.checkUserEmailExists(email);
        if (emailExists) {
            res.status(400).json({ type: "error", message: "Email is already registered" });
            return;
        }

        const mobileExists = await user_dao.checkUserMobileExists(mobile);
        if (mobileExists) {
            res.status(400).json({ type: "error", message: "Mobile number is already registered" });
            return;
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Persist User
        const newUser = await user_dao.createUser(name, email, mobile, passwordHash, role);

        res.status(201).json({
            type: "success",
            message: "User registered successfully",
            data: newUser
        });
    } catch (error) {
        console.error("Register controller error:", error);
        res.status(500).json({ type: "error", message: "Registration failed" });
    }
};

export const setPasswordController = async (req: Request, res: Response) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            res.status(400).json({ type: "error", message: "Missing required fields" });
            return;
        }

        // 1. Verify reset token
        let decoded: any;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET || "fallback_secret");
            if (decoded.type !== "password_reset") {
                throw new Error("Invalid token type");
            }
        } catch (err) {
            res.status(401).json({ type: "error", message: "Invalid or expired reset token" });
            return;
        }

        const userId = decoded.userId;

        // 2. Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 3. Update password in DB
        const success = await user_dao.resetPasswordWithoutCompanyDAO(userId, hashedPassword);

        if (!success) {
            res.status(500).json({ type: "error", message: "Failed to update password" });
            return;
        }

        // 4. Issue tokens (user is now fully logged in)
        const user = await user_dao.getUserLoginById(userId);

        const accessToken = tokenService.generateAccessToken({
            id: user.el_id,
            name: user.el_name,
            email: '',
            mobile: '',
            role: user.el_role,
            societyId: 0,
            accessType: 'AD'
        }, req.clientId);

        const refreshToken = await tokenService.generateRefreshToken({
            id: user.el_id,
            name: user.el_name,
            email: '',
            mobile: '',
            role: user.el_role,
            societyId: 0,
            accessType: 'AD',
            clientId: req.clientId
        }, "default");

        await user_dao.updateUserLastLoggedIn(user.el_id);

        const permissions = await perm_dao.getRolePermissionsDAO(user.el_role);
        const pmCodes = permissions.map((p: any) => p.pm_code);

        res.status(200).json({
            type: "success",
            message: "Password set successfully and login successful",
            accessToken,
            refreshToken,
            data: {
                id: user.el_id,
                name: user.el_name,
                flatNo: '',
                societyId: 0,
                role: user.el_role,
                accessType: 'AD',
                permissions: pmCodes
            }
        });

    } catch (error) {
        console.error("Set password error:", error);
        res.status(500).json({ type: "error", message: "Failed to set password" });
    }
};

export const verifyDeviceOtpController = async (req: Request, res: Response) => {
    try {
        const { userId, deviceId, otp, verificationToken } = req.body;

        if (!userId || !deviceId || !otp || !verificationToken) {
            res.status(400).json({ type: "error", message: "Missing required fields" });
            return;
        }

        const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
        const identifier = userId.toString();

        if (await bruteForceService.isBlocked(identifier, clientIp)) {
            const ttl = await bruteForceService.getRemainingCooldown(identifier, clientIp);
            const minutes = Math.ceil(ttl / 60);
            res.status(429).json({ type: "error", message: `Too many failed attempts. Please try again after ${minutes} minutes.` });
            return;
        }

        try {
            // 1. Verify OTP using otpManager
            const isValid = otpManager.verifyOTP(identifier, otp);
            if (!isValid) {
                await bruteForceService.registerFail(identifier, clientIp);
                res.status(400).json({ type: "error", message: "Invalid or expired OTP" });
                return;
            }

            // 2. Secondary JWT verification to ensure payload integrity
            const decoded: any = jwt.verify(verificationToken, process.env.JWT_SECRET || "fallback_secret");
            if (decoded.userId !== userId || decoded.deviceId !== deviceId) {
                res.status(400).json({ type: "error", message: "Invalid verification session" });
                return;
            }

            // Success: Reset counter
            await bruteForceService.reset(identifier, clientIp);

            // 3. Mark device as verified
            const markedDevice: any = await user_dao.markDeviceAsVerified(userId, deviceId);
            const user = await user_dao.getUserLoginById(userId);

            if (markedDevice?.isFirstTime) {
                const isGatekeeper = user.ul_access_type === "GK" || user.ul_access_type === "GA";
                const appName = user.ul_role === 1 ? "Admin" : (isGatekeeper ? "Security" : "Resident");
                email_dao.sendNewDeviceLoginEmail(user.ul_email, {
                    userName: user.ul_name || user.ul_username || user.ul_mobile,
                    deviceName: markedDevice.utd_device_name || "Unknown Device",
                    userAgent: req.headers['user-agent'] || "Unknown",
                    ipAddress: clientIp,
                    appName: appName as any
                }).catch((e: any) => console.error("New device email error:", e));
            }

            // 4. Issue standard tokens or require password reset if default
            if (user.ul_first_time_login || user.ul_password === DEFAULT_PASSWORD) {
                const resetToken = jwt.sign({
                    userId: user.ul_id,
                    cmId: user.ul_cm_id,
                    type: "password_reset"
                }, process.env.JWT_SECRET || "fallback_secret", {
                    expiresIn: "15m"
                });

                res.status(200).json({
                    type: "reset_password_required",
                    message: "Please reset your default password to continue",
                    resetToken,
                    userId: user.ul_id
                });
                return;
            }

            const accessToken = tokenService.generateAccessToken({
                id: user.ul_id,
                name: user.ul_name,
                email: user.ul_email,
                mobile: user.ul_mobile,
                role: user.ul_role,
                societyId: user.ul_cm_id,
                accessType: user.ul_access_type
            }, req.clientId);

            const refreshToken = await tokenService.generateRefreshToken({
                id: user.ul_id,
                name: user.ul_name,
                email: user.ul_email,
                mobile: user.ul_mobile,
                role: user.ul_role,
                societyId: user.ul_cm_id,
                accessType: user.ul_access_type,
                clientId: req.clientId
            }, deviceId || "default");

            await user_dao.updateUserLastLoggedIn(user.ul_id);
            await user_dao.logUserActivity(user.ul_id, user.ul_cm_id, 'login', req.headers['user-agent'] || 'Unknown');

            const permissions = await perm_dao.getRolePermissionsDAO(user.ul_role);
            const pmCodes = permissions.map((p: any) => p.pm_code);

            res.status(200).json({
                type: "success",
                message: "Device verified and login successful",
                accessToken,
                refreshToken,
                data: {
                    id: user.ul_id,
                    name: user.ul_name,
                    flatNo: user.ul_flat_no,
                    societyId: user.ul_cm_id,
                    role: user.ul_role,
                    accessType: user.ul_access_type,
                    permissions: pmCodes
                }
            });

        } catch (err) {
            res.status(401).json({ type: "error", message: "Verification session expired" });
        }
    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({ type: "error", message: "Verification failed" });
    }
};

export const resendDeviceOtpController = async (req: Request, res: Response) => {
    try {
        const { userId, deviceId } = req.body;
        if (!userId || !deviceId) {
            res.status(400).json({ type: "error", message: "Missing required fields" });
            return;
        }

        const user = await user_dao.getUserLoginById(userId);
        if (!user || !user.ul_email) {
            res.status(400).json({ type: "error", message: "User or email not found" });
            return;
        }

        const otp = otpManager.generateOTP(userId.toString(), user.ul_email);
        const verificationToken = jwt.sign(
            { userId: user.ul_id, deviceId, otp },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "10m" }
        );

        const appName = user.ul_role === 1 ? "Admin" : (user.ul_access_type === "GK" ? "Security" : "Resident");
        await email_dao.sendOTPEmail(user.ul_email, "Login Verification - OTP Resent", {
            userName: user.ul_name || "User",
            otp,
            appName: appName as any,
            purpose: "Login Verification (Resent)"
        });

        res.status(200).json({
            type: "success",
            message: "OTP has been resent to your email.",
            verificationToken
        });

    } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({ type: "error", message: "Failed to resend OTP" });
    }
};

export const logoutUserController = async (req: Request, res: Response) => {
    try {
        const userPayload = req.user;
        const deviceId = req.headers['device-id'] as string || "default";

        if (userPayload?.id) {
            await tokenService.revokeToken(userPayload.id, deviceId);
            await user_dao.logUserActivity(userPayload.id, userPayload.company, 'logout', req.headers['user-agent'] || 'Unknown');
        }

        res.status(200).json({ type: "success", message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ type: "error", message: "Logout failed" });
    }
};

export const refreshTokenController = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ type: "error", message: "Refresh token required" });
        }

        const decoded = await tokenService.verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({ type: "error", message: "Invalid or expired refresh token" });
        }

        const user = await user_dao.getUserLoginById(decoded.id);

        if (!user || user.ul_status === false) {
            return res.status(401).json({ type: "error", message: "Account deactivated or not found" });
        }

        const accessToken = tokenService.generateAccessToken({
            id: user.ul_id,
            name: user.ul_name,
            email: user.ul_email,
            mobile: user.ul_mobile,
            role: user.ul_role,
            societyId: user.ul_cm_id,
            accessType: user.ul_access_type
        }, decoded.clientId || req.clientId);

        res.status(200).json({
            type: "success",
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(500).json({ type: "error", message: "Failed to refresh token" });
    }
};

export const getProfile = async (request: Request, response: Response): Promise<void> => {
    console.log(request.body);
    response.status(200).json({ type: "success", message: "User profile fetched successfully" });
}

export const getLoginCredentials = async (request: Request, response: Response): Promise<void> => {
    const { company, page = 1, pageSize = 100 } = request.query;
    const limit = Number(pageSize);
    const offset = (Number(page) - 1) * limit;

    const results = await user_dao.getLoginCredentialsDAO(Number(company), limit, offset);
    response.status(200).json({ type: "success", message: "User login credentials fetched successfully", data: results });
}

export const createLoginCredential = async (request: Request, response: Response): Promise<void> => {
    const { company } = request.query;
    const {
        ul_username,
        ul_mobile,
        ul_email,
        ul_name,
        ul_access_type,
        ul_flat_no,
        ul_designation,
        ul_cm_access,
        ul_role,
        username
    } = request.body;

    // Check for duplicate email or mobile
    const duplicates = await user_dao.checkDuplicateEmailMobileDAO(ul_email, ul_mobile);
    if (duplicates.length > 0) {
        const isEmailDuplicate = duplicates.some((u: any) => u.ul_email === ul_email);
        const isMobileDuplicate = duplicates.some((u: any) => u.ul_mobile === ul_mobile);

        if (isEmailDuplicate && isMobileDuplicate) {
            response.status(400).json({ type: "error", message: "Both email and mobile number are already registered" });
        } else if (isEmailDuplicate) {
            response.status(400).json({ type: "error", message: "Email already exists" });
        } else {
            response.status(400).json({ type: "error", message: "Mobile number already exists" });
        }
        return;
    }

    const data = {
        ul_username,
        ul_mobile,
        ul_email,
        ul_name,
        ul_access_type,
        ul_flat_no,
        ul_designation,
        ul_cm_access,
        ul_role,
        ul_status: true,
        username
    };

    const result = await user_dao.createLoginCredentialDAO(data, Number(company));

    response.status(200).json({ type: "success", message: "User created successfully", data: result });
}

export const updateLoginCredential = async (request: Request, response: Response): Promise<void> => {
    const { company } = request.query;
    const {
        ul_id,
        ul_username,
        ul_mobile,
        ul_email,
        ul_name,
        ul_access_type,
        ul_flat_no,
        ul_designation,
        ul_cm_access,
        ul_role,
        username
    } = request.body;

    // Check for duplicate email or mobile, excluding the current user
    const duplicates = await user_dao.checkDuplicateEmailMobileDAO(ul_email, ul_mobile, Number(ul_id));
    if (duplicates.length > 0) {
        const isEmailDuplicate = duplicates.some((u: any) => u.ul_email === ul_email);
        const isMobileDuplicate = duplicates.some((u: any) => u.ul_mobile === ul_mobile);

        if (isEmailDuplicate && isMobileDuplicate) {
            response.status(400).json({ type: "error", message: "Both email and mobile number are already in use by another user" });
        } else if (isEmailDuplicate) {
            response.status(400).json({ type: "error", message: "Email already exists" });
        } else {
            response.status(400).json({ type: "error", message: "Mobile number already exists" });
        }
        return;
    }

    const data = {
        ul_id,
        ul_username,
        ul_mobile,
        ul_email,
        ul_name,
        ul_access_type,
        ul_flat_no,
        ul_designation,
        ul_cm_access,
        ul_role,
        username
    };
    const result = await user_dao.updateLoginCredentialDAO(Number(ul_id), Number(company), data);

    // 🔥 Invalidate auth cache to force permission refresh
    const cacheKey = CacheKeys.company.auth.user(Number(company), Number(ul_id), ul_email);
    await deleteCache(cacheKey);

    response.status(200).json({ type: "success", message: "User updated successfully", data: result });
}

export const getLoginCredentialById = async (request: Request, response: Response): Promise<void> => {
    const { company } = request.query;
    const { id } = request.params;

    const result = await user_dao.getLoginCredentialByIdDAO(Number(id), Number(company));
    if (result) {
        response.status(200).json({ type: "success", message: "User fetched successfully", data: result });
    } else {
        response.status(404).json({ type: "error", message: "User not found" });
    }
}

export const deactivateUser = async (request: Request, response: Response): Promise<void> => {
    const { company } = request.query;
    const { user } = request.body;
    const result = await user_dao.deactivateUserDAO(Number(user), Number(company));
    if (result) {
        // 🔥 Invalidate auth cache for this user
        await deleteByPattern(`company:${company}:auth:user:${user}:*`);
        response.status(200).json({ type: "success", message: "User deactivated successfully" });
    } else {
        response.status(400).json({ type: "error", message: "Failed to deactivate user" });
    }
}

export const reactivateUser = async (request: Request, response: Response): Promise<void> => {
    const { company } = request.query;
    const { user } = request.body;
    const result = await user_dao.reactivateUserDAO(Number(user), Number(company));
    if (result) {
        // 🔥 Invalidate auth cache for this user
        await deleteByPattern(`company:${company}:auth:user:${user}:*`);
        response.status(200).json({ type: "success", message: "User reactivated successfully" });
    } else {
        response.status(400).json({ type: "error", message: "Failed to reactivate user" });
    }
}

export const resetPassword = async (request: Request, response: Response): Promise<void> => {
    const { company } = request.query;
    const { userId } = request.body;
    // logic to reset password to DEFAULT_PASSWORD
    // DEFAULT_PASSWORD is already hashed in constants.ts
    const result = await user_dao.resetPasswordDAO(Number(userId), Number(company), DEFAULT_PASSWORD);
    if (result) {
        response.status(200).json({ type: "success", message: "Password reset successfully" });
    } else {
        response.status(400).json({ type: "error", message: "Failed to reset password" });
    }
}

export const updateUserMobile = async (request: Request, response: Response): Promise<void> => {
    const { userId, companyId, newMobile } = request.body;
    const result = await user_dao.updateUserMobileDAO(Number(userId), Number(companyId), newMobile);
    if (result) {
        response.status(200).json({ type: "success", message: "Mobile number updated successfully" });
    } else {
        response.status(400).json({ type: "error", message: "Failed to update mobile number" });
    }
}