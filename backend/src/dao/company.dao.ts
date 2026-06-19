import { pool } from '../lib/db';
import { getOrSetCache, TTL } from '../lib/cache';
import { CacheKeys } from '../lib/cacheKeys';

export const getUserCompanyDAO = async (userId: number) => {
    const query = `
        SELECT cm_id, cm_name, cm_abrevation
        FROM company_master cm
        WHERE cm.cm_id IN (
            SELECT em.em_cm_id
            FROM public.employee_login el
            JOIN public.employee_master em ON el.el_em_id = em.em_id
            WHERE el.el_id = $1
        )
        ORDER BY cm_id;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows || [];
}

export const fetchAllCompanies = async (username: string) => {
    try {
        // Check if user is in users table and is an Admin
        const userRoleQuery = `SELECT role FROM users WHERE email = $1 LIMIT 1`;
        const userRoleRes = await pool.query(userRoleQuery, [username]);
        if (userRoleRes.rows.length > 0 && userRoleRes.rows[0].role === 'Admin') {
            const allQuery = `SELECT * FROM company_master ORDER BY cm_id;`;
            const { rows } = await pool.query(allQuery);
            return rows || [];
        }
    } catch (e) {
        console.error("Error checking user role in fetchAllCompanies:", e);
    }

    const query = `
        SELECT 
            cm.*
        FROM company_master cm
        WHERE cm.cm_id IN (
            SELECT em.em_cm_id
            FROM public.employee_login el
            JOIN public.employee_master em ON el.el_em_id = em.em_id
            WHERE el.el_username = $1
        )
        ORDER BY cm.cm_id;
    `;
    const { rows } = await pool.query(query, [username]);
    if (rows.length === 0) {
        // Fallback: return all active companies in development
        const fallbackQuery = `SELECT * FROM company_master WHERE cm_status = true ORDER BY cm_id;`;
        const fallbackRes = await pool.query(fallbackQuery);
        return fallbackRes.rows || [];
    }
    return rows || [];
}

export const createCompanyDAO = async (name: string, email: string) => {
    const query = `
        INSERT INTO company_master (cm_name, cm_email)
        VALUES ($1, $2)
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [name, email]);
    if (rows) {
        return rows[0];
    }
    else {
        return null;
    }
};

export const getOnboardingCompanyByEmailDAO = async (email: string) => {
    const query = `
        SELECT * 
        FROM company_master 
        WHERE cm_email = $1;
    `;
    const { rows } = await pool.query(query, [email]);
    if (rows) {
        return rows;
    }
    else {
        return [];
    }
};

export const getCompanyByEmailDAO = async (email: string) => {
    const query = `
        SELECT * FROM company_master WHERE cm_email = $1;
    `;
    const { rows } = await pool.query(query, [email]);
    if (rows) {
        return rows;
    }
    else {
        return [];
    }
};

export const updateCompanyRegistrationDetailsDAO = async (
    cm_id: number,
    cm_name: string,
    cm_registration_no: string,
    cm_pan_no?: string,
    cm_gstin_no?: string,
    cm_logo?: string,
    cm_acc_name?: string,
    cm_acc_no?: string,
    cm_ifsc?: string,
    cm_acc_type?: string,
    cm_branch_name?: string,
    cm_upi_id?: string
) => {
    const query = `
        UPDATE company_master
        SET 
            cm_name = $2,
            cm_registration_no = $3,
            cm_pan_no = $4,
            cm_gstin_no = $5,
            cm_logo = $6,
            cm_acc_name = $7,
            cm_acc_no = $8,
            cm_ifsc = $9,
            cm_acc_type = $10,
            cm_branch_name = $11,
            cm_upi_id = $12,
            cm_last_update_date = CURRENT_TIMESTAMP
        WHERE cm_id = $1
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [
        cm_id,
        cm_name,
        cm_registration_no,
        cm_pan_no || null,
        cm_gstin_no || null,
        cm_logo || null,
        cm_acc_name || null,
        cm_acc_no || null,
        cm_ifsc || null,
        cm_acc_type || null,
        cm_branch_name || null,
        cm_upi_id || null
    ]);
    return rows ? rows[0] : null;
};

export const updateCompanyStructuralDetailsDAO = async (
    cm_id: number,
    cm_num_wings: number,
    cm_floors_per_wing: number,
    cm_units_per_floor: number,
    cm_num_shops: number,
    cm_num_offices: number,
    cm_refuge_flats: string[],
    cm_area_unit: string
) => {
    const query = `
        UPDATE company_master
        SET 
            cm_num_wings = $2,
            cm_floors_per_wing = $3,
            cm_units_per_floor = $4,
            cm_num_shops = $5,
            cm_num_offices = $6,
            cm_refuge_flats = $7,
            cm_area_unit = $8,
            cm_last_update_date = CURRENT_TIMESTAMP
        WHERE cm_id = $1
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [
        cm_id,
        cm_num_wings || 1,
        cm_floors_per_wing || 1,
        cm_units_per_floor || 1,
        cm_num_shops || 0,
        cm_num_offices || 0,
        cm_refuge_flats || null,
        cm_area_unit || 'Square Feet'
    ]);
    return rows ? rows[0] : null;
};

export const getCompanyByIdDAO = async (cm_id: number) => {
    const query = `SELECT * FROM company_master WHERE cm_id = $1`;
    const { rows } = await pool.query(query, [cm_id]);
    return rows ? rows[0] : null;
};

export const getCachedCompanyById = async (cm_id: number) => {
    return await getOrSetCache(
        CacheKeys.company.details.one(cm_id),
        TTL.CONFIG,
        () => getCompanyByIdDAO(cm_id)
    );
};

export const updateCompanyGoAheadDAO = async (cm_id: number) => {
    const query = `
        UPDATE company_master
        SET cm_go_ahead_flag = false,
            cm_last_update_date = CURRENT_TIMESTAMP
        WHERE cm_id = $1
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [cm_id]);
    return rows ? rows[0] : null;
};

// UNIQUENESS CHECKS
export const checkRegistrationAvailabilityDAO = async (regNo: string, excludeId?: number) => {
    const query = excludeId
        ? `SELECT 1 FROM company_master WHERE cm_registration_no = $1 AND cm_id != $2 LIMIT 1`
        : `SELECT 1 FROM company_master WHERE cm_registration_no = $1 LIMIT 1`;
    const params = excludeId ? [regNo, excludeId] : [regNo];
    const { rows } = await pool.query(query, params);
    return rows.length > 0;
};

export const checkPanAvailabilityDAO = async (panNo: string, excludeId?: number) => {
    const query = excludeId
        ? `SELECT 1 FROM company_master WHERE cm_pan_no = $1 AND cm_id != $2 LIMIT 1`
        : `SELECT 1 FROM company_master WHERE cm_pan_no = $1 LIMIT 1`;
    const params = excludeId ? [panNo, excludeId] : [panNo];
    const { rows } = await pool.query(query, params);
    return rows.length > 0;
};

export const checkGSTINAvailabilityDAO = async (gstinNo: string, excludeId?: number) => {
    const query = excludeId
        ? `SELECT 1 FROM company_master WHERE cm_gstin_no = $1 AND cm_id != $2 LIMIT 1`
        : `SELECT 1 FROM company_master WHERE cm_gstin_no = $1 LIMIT 1`;
    const params = excludeId ? [gstinNo, excludeId] : [gstinNo];
    const { rows } = await pool.query(query, params);
    return rows.length > 0;
};

export const getAllCompanyMasterDAO = async () => {
    const query = `
        SELECT
          cm_id,
          cm_code,
          cm_name,
          cm_registration_no,
          cm_status,
          cm_create_date,
          cm_create_by,
          cm_update_date,
          cm_update_by
        FROM company_master
        ORDER BY cm_id DESC;
    `;
    const { rows } = await pool.query(query);
    return rows || [];
};

export const getCompanyMasterByIdDAO = async (id: number) => {
    const query = `
        SELECT *
        FROM company_master
        WHERE cm_id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows ? rows[0] : null;
};

export const createCompanyMasterDAO = async (data: {
    cm_name: string;
    cm_code?: string;
    cm_registration_no?: string;
    cm_status?: boolean;
}, createdBy: string) => {
    const query = `
        INSERT INTO company_master (
          cm_name,
          cm_code,
          cm_registration_no,
          cm_status,
          cm_create_by,
          cm_create_date,
          cm_update_date
        )
        VALUES ($1, $2, $3, COALESCE($4, true), $5, NOW(), NOW())
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [
        data.cm_name,
        data.cm_code || null,
        data.cm_registration_no || null,
        data.cm_status !== undefined ? data.cm_status : true,
        createdBy
    ]);
    return rows ? rows[0] : null;
};

export const updateCompanyMasterDAO = async (id: number, data: {
    cm_name: string;
    cm_code?: string;
    cm_registration_no?: string;
    cm_status?: boolean;
}, updatedBy: string) => {
    const query = `
        UPDATE company_master
        SET
          cm_name = $1,
          cm_registration_no = $2,
          cm_status = $3,
          cm_update_by = $4,
          cm_update_date = NOW()
        WHERE cm_id = $5
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [
        data.cm_name,
        data.cm_registration_no || null,
        data.cm_status !== undefined ? data.cm_status : true,
        updatedBy,
        id
    ]);
    return rows ? rows[0] : null;
};

export const deactivateCompanyMasterDAO = async (id: number, updatedBy: string) => {
    const query = `
        UPDATE company_master
        SET
          cm_status = false,
          cm_update_by = $1,
          cm_update_date = NOW()
        WHERE cm_id = $2
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [updatedBy, id]);
    return rows ? rows[0] : null;
};

export const getCompanyMasterDropdownDAO = async () => {
    const query = `
        SELECT
          cm_id AS value,
          cm_name AS label
        FROM company_master
        WHERE cm_status = true
        ORDER BY cm_name;
    `;
    const { rows } = await pool.query(query);
    return rows || [];
};

