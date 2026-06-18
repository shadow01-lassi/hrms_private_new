import { pool, withTransaction } from "../lib/db";

export const getAllPermissionsDAO = async () => {
    const query = `
        SELECT pm_id, pm_code, pm_description
        FROM permission_master
        ORDER BY pm_id;
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

export const createRoleWithPermissionsDAO = async (name: string, description: string, pmIds: number[], createdBy?: string) => {
    return withTransaction(async (client) => {
        // 1. Insert into role_master
        const roleQuery = `
            INSERT INTO role_master (rm_name, rm_description, rm_create_by, rm_create_date)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            RETURNING rm_id;
        `;
        const { rows } = await client.query(roleQuery, [name, description, createdBy || "system"]);
        const rmId = rows[0].rm_id;

        // 2. Insert into role_permissions
        if (pmIds && pmIds.length > 0) {
            const values: any[] = [rmId];
            const placeholders = pmIds.map((id, i) => {
                values.push(id);
                return `($1, $${i + 2})`;
            }).join(", ");

            await client.query(`
                INSERT INTO role_permissions (rp_rm_id, rp_pm_id)
                VALUES ${placeholders}
            `, values);
        }

        return rmId;
    });
};

export const updateRoleWithPermissionsDAO = async (rmId: number, name: string, description: string, pmIds: number[], updatedBy?: string) => {
    return withTransaction(async (client) => {
        // 1. Update role_master identity and legacy array
        const roleUpdateQuery = `
            UPDATE role_master 
            SET rm_name = $1, rm_description = $2, rm_last_update_by = $3, rm_last_update_date = CURRENT_TIMESTAMP
            WHERE rm_id = $4;
        `;
        await client.query(roleUpdateQuery, [name, description, updatedBy || "system", rmId]);

        // 2. Sync role_permissions (Delete all then insert)
        await client.query("DELETE FROM role_permissions WHERE rp_rm_id = $1", [rmId]);

        if (pmIds && pmIds.length > 0) {
            const values: any[] = [rmId];
            const placeholders = pmIds.map((id, i) => {
                values.push(id);
                return `($1, $${i + 2})`;
            }).join(", ");

            await client.query(`
                INSERT INTO role_permissions (rp_rm_id, rp_pm_id)
                VALUES ${placeholders}
            `, values);
        }

        return true;
    });
};

export const checkPermissionDAO = async (rmId: number, permissionCode: string) => {
    const query = `
        SELECT EXISTS (
            SELECT 1 
            FROM role_permissions rp
            JOIN permission_master pm ON rp.rp_pm_id = pm.pm_id
            WHERE rp.rp_rm_id = $1 AND pm.pm_code = $2
        );
    `;
    console.log(`[DAO Query] checkPermissionDAO - Role: ${rmId}, Code: ${permissionCode}`);
    const { rows } = await pool.query(query, [rmId, permissionCode]);
    const exists = rows[0].exists;
    console.log(`[DAO Result] checkPermissionDAO - Exists: ${exists}`);
    return exists;
};
