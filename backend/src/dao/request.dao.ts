import { pool } from "../lib/db";

export const fetchRequests = async (company: number, flat_no?: string) => {
    const query = `
        SELECT r.*, '' as flat_no 
        FROM requests r, public.employee_login u
        WHERE r.r_created_by = u.el_username
            AND r.r_cm_id = $1
            ${flat_no ? " AND r.r_flat_no = $2 " : ""};
    `;

    const queryParams: any[] = [company];
    if (flat_no) {
        queryParams.push(flat_no);
    }
    const { rows } = await pool.query(query, queryParams);
    return rows || [];
}

export const postRequestDAO = async (data: any, company: number) => {
    const query = `
        INSERT INTO requests (
            r_cm_id,
            r_type,
            r_description,
            r_status,
            r_created_by,
            r_flat_no
        ) VALUES (
            $1,   
            $2,   
            $3,   
            'pending',
            $4,
            $5
        ) returning *;
    `;
    const { rows } = await pool.query(query, [
        company,
        data.r_type,
        data.r_description,
        data.username,
        data.r_flat_no
    ]);
    return rows[0];
}

export const editRequestDAO = async (r_id: number, data: any, company: number) => {
    const query = `
        UPDATE requests
        SET 
            r_status = $1,
            r_last_edited_by = $2,
            r_last_edited_date = CURRENT_TIMESTAMP,
            r_admin_comment = COALESCE($4, r_admin_comment)
        WHERE r_id = $3
            AND r_cm_id = $5
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [
        data.r_status,
        data.username,
        r_id,
        data.r_admin_comment,
        company
    ]);
    return rows[0];
}