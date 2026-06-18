import { pool } from "../lib/db";

export const getAllReasonDAO = async () => {
    const query = `
        SELECT *
        FROM reason_master
        ORDER BY rm_id;
    `;
    const { rows } = await pool.query(query);
    return rows || [];
};

export const getRolePermissionsDAO = async (rmId: number) => {
    const query = `
        SELECT pm.pm_id, pm.pm_code, pm.pm_description
        FROM role_permissions rp
        JOIN permission_master pm ON rp.rp_pm_id = pm.pm_id
        WHERE rp.rp_rm_id = $1
        ORDER BY pm.pm_id;
    `;
    const { rows } = await pool.query(query, [rmId]);
    return rows || [];
};