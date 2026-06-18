// TODO Phase 2: getLoginCredentialsDAO / createLoginCredentialDAO etc. still reference el_email/el_mobile/el_cm_id columns which do not exist in current schema
import { DEFAULT_PASSWORD } from "../constants";
import { pool, withTransaction } from "../lib/db";
import { processEntryPhotos } from "../utils";

export const getUser = async (id: number) => {
    const query = `
        SELECT *
        FROM employee_login
        WHERE el_id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows) {
        return rows[0];
    }
    else {
        return null;
    }
};

export const getUserByIdEmail = async (id: number, email: string) => {
    // 1. Check users table first
    const usersQuery = `
        SELECT id, name, email, mobile, role
        FROM users
        WHERE id = $1
        LIMIT 1;
    `;
    try {
        const { rows } = await pool.query(usersQuery, [id]);
        if (rows && rows.length > 0) {
            const u = rows[0];
            return {
                el_id: u.id,
                el_username: u.email,
                el_name: u.name,
                el_role: u.role === "Admin" ? 1 : (u.role === "Manager" ? 2 : 3),
                el_active: true
            };
        }
    } catch (e) {
        console.error("Error querying users table in getUserByIdEmail, falling back:", e);
    }

    // 2. Fallback to employee_login
    const query = `
        SELECT el_id, el_username, el_name, el_role, el_active
        FROM public.employee_login
        WHERE el_id = $1 AND el_active = true;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
};

export const getUserByEmailOrMobile = async (email_mobile: string) => {
    // 1. Check new users table first
    const usersQuery = `
        SELECT id, name, email, mobile, password_hash, role
        FROM users
        WHERE email = $1 OR mobile = $1
        LIMIT 1;
    `;
    try {
        const { rows } = await pool.query(usersQuery, [email_mobile]);
        if (rows && rows.length > 0) {
            const u = rows[0];
            return {
                el_id: u.id,
                el_username: u.email,
                el_name: u.name,
                el_password: u.password_hash,
                el_role: u.role === "Admin" ? 1 : (u.role === "Manager" ? 2 : 3),
                el_active: true
            };
        }
    } catch (e) {
        console.error("Error querying users table, falling back:", e);
    }

    // 2. Fallback to employee_login table
    const query = `SELECT el_id, el_username, el_name, el_password, el_role, el_active FROM public.employee_login WHERE el_username = $1 AND el_active = true LIMIT 1;`;
    const { rows } = await pool.query(query, [email_mobile]);
    return rows[0] || null;
};

export const checkDuplicateEmailMobileDAO = async (email: string, mobile: string, excludeId?: number) => {
    let query = `
        SELECT el_email, el_mobile
        FROM employee_login
        WHERE (el_email = $1 OR el_mobile = $2)
    `;
    const params: any[] = [email, mobile];

    if (excludeId) {
        query += ` AND el_id != $3`;
        params.push(excludeId);
    }

    const { rows } = await pool.query(query, params);
    return rows;
};

export const checkUsernameAvailabilityDAO = async (username: string, excludeId?: number) => {
    let query = `SELECT el_id FROM employee_login WHERE el_username = $1`;
    const params: any[] = [username];
    if (excludeId) {
        query += ` AND el_id != $2`;
        params.push(excludeId);
    }
    const { rows } = await pool.query(query, params);
    return rows.length > 0;
};

export const checkEmailAvailabilityDAO = async (email: string, excludeId?: number) => {
    let query = `SELECT el_id FROM employee_login WHERE el_email = $1`;
    const params: any[] = [email];
    if (excludeId) {
        query += ` AND el_id != $2`;
        params.push(excludeId);
    }
    const { rows } = await pool.query(query, params);
    return rows.length > 0;
};

export const checkMobileAvailabilityDAO = async (mobile: string, excludeId?: number) => {
    let query = `SELECT el_id FROM employee_login WHERE el_mobile = $1`;
    const params: any[] = [mobile];
    if (excludeId) {
        query += ` AND el_id != $2`;
        params.push(excludeId);
    }
    const { rows } = await pool.query(query, params);
    return rows.length > 0;
};

export const getLoginCredentialsDAO = async (company: number, limit: number, offset: number) => {
    const query = `
        SELECT 
            el_id,
            el_name,
            el_email,
            el_mobile,
            el_access_type,
            el_cm_id,
            el_status,
            el_flat_no,
            el_designation,
            el_cm_access
        FROM employee_login
        WHERE el_cm_id = $1
        ORDER BY el_id DESC
        LIMIT $2 OFFSET $3;
    `;
    const countQuery = `SELECT COUNT(*) FROM employee_login WHERE el_cm_id = $1;`;

    const { rows } = await pool.query(query, [company, limit, offset]);
    const countResult = await pool.query(countQuery, [company]);

    if (rows) {
        return { data: rows, total_count: parseInt(countResult.rows[0].count) };
    }
    else {
        return null;
    }
};

export const deactivateUserDAO = async (userId: number, companyId: number) => {
    const query = `
        UPDATE employee_login 
        SET el_status = false 
        WHERE el_id = $1 
          AND el_cm_id = $2 
        RETURNING el_id;
    `;
    const { rows } = await pool.query(query, [userId, companyId]);
    return rows.length > 0;
};

export const reactivateUserDAO = async (userId: number, companyId: number) => {
    const query = `
        UPDATE employee_login 
        SET el_status = true 
        WHERE el_id = $1 
          AND el_cm_id = $2 
        RETURNING el_id;
    `;
    const { rows } = await pool.query(query, [userId, companyId]);
    return rows.length > 0;
};

export const resetPasswordDAO = async (userId: number, companyId: number, newPasswordHash: string) => {
    const query = `
        UPDATE employee_login 
        SET el_password = $3 
        WHERE el_id = $1 
          AND el_cm_id = $2 
        RETURNING el_id;
    `;
    const { rows } = await pool.query(query, [userId, companyId, newPasswordHash]);
    return rows.length > 0;
};

export const resetPasswordWithoutCompanyDAO = async (userId: number, newPasswordHash: string) => {
    const query = `
        UPDATE employee_login 
        SET el_password = $2 
        WHERE el_id = $1 
        RETURNING el_id;
    `;
    const { rows } = await pool.query(query, [userId, newPasswordHash]);
    return rows.length > 0;
};

export const updateUserMobileDAO = async (userId: number, companyId: number, newMobile: string) => {
    const query = `
        UPDATE employee_login 
        SET el_mobile = $3 
        WHERE el_id = $1 
          AND el_cm_id = $2 
        RETURNING el_id;
    `;
    const { rows } = await pool.query(query, [userId, companyId, newMobile]);
    return rows.length > 0;
};

export const createLoginCredentialDAO = async (data: any, company: number) => {
    const { el_username, el_mobile, el_email, el_name, el_access_type, el_flat_no, el_status, el_designation, el_cm_access, el_role } = data;

    const role = el_role || (el_access_type === "AD" ? 1 : 2);
    const final_cm_access = el_cm_access || [company];

    const query = `
        INSERT INTO employee_login (
            el_username, 
            el_mobile, 
            el_email, 
            el_name, 
            el_access_type, 
            el_flat_no, 
            el_cm_id, 
            el_password, 
            el_status,
            el_role,
            el_cm_access,
            el_designation
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        ) RETURNING *;
    `;

    const { rows } = await pool.query(query, [
        el_username, el_mobile, el_email, el_name, el_access_type,
        el_flat_no, company, DEFAULT_PASSWORD, el_status, role, final_cm_access,
        el_designation
    ]);

    return rows[0];
};

export const updateLoginCredentialDAO = async (el_id: number, el_cm_id: number, data: any) => {
    const { el_username, el_mobile, el_email, el_name, el_access_type, el_flat_no, el_designation, el_cm_access, el_role } = data;

    const role = el_role || (el_access_type === "AD" ? 1 : 2);

    const query = `
        UPDATE employee_login 
        SET 
            el_username = $1,
            el_mobile = $2,
            el_email = $3,
            el_name = $4,
            el_access_type = $5,
            el_flat_no = $6,
            el_role = $7,
            el_cm_access = $8,
            el_designation = $9
        WHERE el_id = $10 
          AND el_cm_id = $11
        RETURNING *;
    `;

    const { rows } = await pool.query(query, [
        el_username, el_mobile, el_email, el_name, el_access_type,
        el_flat_no, role, el_cm_access, el_designation,
        el_id, el_cm_id
    ]);

    return rows[0];
};

export const getLoginCredentialByIdDAO = async (id: number, companyId: number) => {
    const query = `
        SELECT 
            el_id, 
            el_name,
            el_email,
            el_mobile,
            el_username, 
            el_role, 
            el_access_type, 
            el_flat_no, 
            el_cm_id, 
            el_status,
            el_designation,
            el_cm_access
        FROM employee_login
        WHERE el_id = $1 
          AND el_cm_id = $2;
    `;
    const { rows } = await pool.query(query, [id, companyId]);
    return rows[0] || null;
};
export const getSocietyAdminsDAO = async (companyId: number) => {
    const query = `
        SELECT 
            el_id, 
            el_name,
            el_email,
            el_mobile,
            el_username, 
            el_role,
            el_designation,
            el_access_type, 
            el_status
        FROM employee_login
        WHERE el_cm_id = $1 
          AND el_access_type = 'AD'
        ORDER BY el_id ASC;
    `;
    const { rows } = await pool.query(query, [companyId]);
    return rows || [];
};

export const syncSocietyAdminsDAO = async (companyId: number, admins: any[]) => {
    const query = `SELECT sync_society_admins($1, $2);`;
    const { rows } = await pool.query(query, [companyId, JSON.stringify(admins)]);
    return rows[0].sync_society_admins;
};

export const getHomeSummary = async (flatNo: string, cmId: number) => {
    // ... existing implementation remains (moved below for clarity if needed, or just kept)
    const query = `
        SELECT 
            gel_id as id,
            gel_name as name, 
            COALESCE(gel_category, 'Guest') as category, 
            -- TO_CHAR(gel_checkin_time, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "checkInTime", 
            gel_checkin_time as "checkInTime",
            gel_status as status,
            gel_photo_url as "photoUrl"
        FROM gate_entry_log
        WHERE gel_flat_no = $1 AND gel_cm_id = $2
        ORDER BY gel_checkin_time DESC
        LIMIT 3;
    `;
    try {
        const { rows } = await pool.query(query, [flatNo, cmId]);
        return rows.map(processEntryPhotos);
    } catch (error) {
        console.error("Error fetching home summary:", error);
        return [];
    }
};

export const createInviteDAO = async (
    cmId: number,
    flatNo: string,
    category: string,
    companyId: number | null,
    guests: any[]
) => {
    return withTransaction(async (client) => {
        // Insert Master
        // vim_id, vim_cm_id, vim_flat_no, vim_category, vim_company_id, vim_status, vim_create_date, vim_visit_date
        const masterQuery = `
            INSERT INTO visitor_invite_master (
                vim_cm_id, 
                vim_flat_no, 
                vim_category, 
                vim_company_id, 
                vim_status, 
                vim_visit_date
            ) VALUES (
                $1, $2, $3, $4, 'pending', NOW()
            ) RETURNING *;
        `;

        const masterRes = await client.query(masterQuery, [cmId, flatNo, category, companyId]);
        const vimId = masterRes.rows[0].vim_id;

        // Insert Details
        // vid_invite_id, vid_cm_id, vid_name, vid_mobile, vid_vehicle_no
        for (const guest of guests) {
            await client.query(`
                INSERT INTO visitor_invite_details (vid_invite_id, vid_cm_id, vid_name, vid_mobile, vid_vehicle_no)
                VALUES ($1, $2, $3, $4, $5)
            `, [vimId, cmId, guest.name, guest.mobile, guest.vehicleNo]);
        }

        return { vimId };
    });
};

export const logUserActivity = async (userId: number, cmId: number, activity: 'login' | 'logout', deviceInfo: string) => {
    const query = `
        INSERT INTO user_activity_log (ual_ul_id, ual_cm_id, ual_activity, ual_device_info)
        VALUES ($1, $2, $3, $4);
    `;
    try {
        await pool.query(query, [userId, cmId, activity, deviceInfo]);
    } catch (error) {
        console.error("Error logging user activity:", error);
    }
};

export const updateUserLastLoggedIn = async (userId: number) => {
    const query = `
        UPDATE employee_login
        SET el_last_logged_in = NOW()
        WHERE el_id = $1;
    `;
    try {
        await pool.query(query, [userId]);
    } catch (error) {
        console.error("Error updating user last logged in:", error);
    }
};

export const getTrustedDevice = async (userId: number, deviceId: string) => {
    const query = `
        SELECT * FROM user_trusted_devices 
        WHERE utd_user_id = $1 AND utd_device_id = $2 AND utd_verified = true;
    `;
    try {
        const { rows } = await pool.query(query, [userId, deviceId]);
        return rows[0];
    } catch (error) {
        console.error("Error getting trusted device:", error);
        return null;
    }
};

export const getTrustedDeviceByFingerprint = async (userId: number, ipAddress: string, userAgent: string) => {
    const query = `
        SELECT * FROM user_trusted_devices 
        WHERE utd_user_id = $1 AND utd_ip_address = $2 AND utd_user_agent = $3 AND utd_verified = true;
    `;
    try {
        const { rows } = await pool.query(query, [userId, ipAddress, userAgent]);
        return rows[0];
    } catch (error) {
        console.error("Error getting trusted device by fingerprint:", error);
        return null;
    }
};

export const createOrUpdateTrustedDevice = async (data: {
    userId: number;
    email: string;
    deviceId: string;
    deviceName: string;
    deviceType: string;
    ipAddress: string;
    userAgent: string;
    verified?: boolean;
}) => {
    const query = `
        INSERT INTO user_trusted_devices 
        (utd_user_id, utd_email, utd_device_id, utd_device_name, utd_device_type, utd_ip_address, utd_user_agent, utd_verified, utd_first_verified_at, utd_last_login_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (utd_user_id, utd_device_id) 
        DO UPDATE SET 
            utd_ip_address = EXCLUDED.utd_ip_address,
            utd_user_agent = EXCLUDED.utd_user_agent,
            utd_verified = user_trusted_devices.utd_verified OR EXCLUDED.utd_verified,
            utd_first_verified_at = COALESCE(user_trusted_devices.utd_first_verified_at, EXCLUDED.utd_first_verified_at),
            utd_last_login_at = NOW()
        RETURNING *;
    `;
    const verified = data.verified || false;
    const firstVerifiedAt = verified ? new Date() : null;

    try {
        const { rows } = await pool.query(query, [
            data.userId,
            data.email,
            data.deviceId,
            data.deviceName,
            data.deviceType,
            data.ipAddress,
            data.userAgent,
            verified,
            firstVerifiedAt,
            new Date()
        ]);
        return rows[0];
    } catch (error) {
        console.error("Error creating/updating trusted device:", error);
        return null;
    }
};

export const markDeviceAsVerified = async (userId: number, deviceId: string) => {
    const checkQuery = `SELECT utd_first_verified_at FROM user_trusted_devices WHERE utd_user_id = $1 AND utd_device_id = $2`;
    const checkRes = await pool.query(checkQuery, [userId, deviceId]);
    const isFirstTime = checkRes.rows.length > 0 && checkRes.rows[0].utd_first_verified_at === null;

    const query = `
        UPDATE user_trusted_devices 
        SET utd_verified = true, utd_first_verified_at = COALESCE(utd_first_verified_at, NOW()), utd_last_login_at = NOW()
        WHERE utd_user_id = $1 AND utd_device_id = $2
        RETURNING *;
    `;
    try {
        const { rows } = await pool.query(query, [userId, deviceId]);
        return { ...rows[0], isFirstTime };
    } catch (error) {
        console.error("Error marking device as verified:", error);
        return null;
    }
};

export const getUserLoginById = async (userId: number) => {
    const query = `
        SELECT *
        FROM employee_login 
        WHERE el_id = $1;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
};

export const getInvitesHistory = async (el_id: number) => {
    const query = `
        SELECT 
            vim.*, vid.*, vcm.vcm_name
        FROM visitor_invite_master vim
        LEFT JOIN visitor_invite_details vid ON vim.vim_id = vid.vid_invite_id
        LEFT JOIN visitor_company_master vcm ON vim.vim_company_id = vcm.vcm_id
        WHERE vim.vim_cm_id = $1
        ORDER BY vim.vim_create_date DESC;
    `;
    const { rows } = await pool.query(query, [el_id]);
    return rows;
};

export const createUser = async (name: string, email: string, mobile: string, passwordHash: string, role: string) => {
    const query = `
        INSERT INTO users (name, email, mobile, password_hash, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, mobile, role, created_at;
    `;
    const { rows } = await pool.query(query, [name, email, mobile, passwordHash, role]);
    return rows[0];
};

export const checkUserEmailExists = async (email: string) => {
    const query = `SELECT id FROM users WHERE email = $1 LIMIT 1;`;
    const { rows } = await pool.query(query, [email]);
    return rows.length > 0;
};

export const checkUserMobileExists = async (mobile: string) => {
    const query = `SELECT id FROM users WHERE mobile = $1 LIMIT 1;`;
    const { rows } = await pool.query(query, [mobile]);
    return rows.length > 0;
};