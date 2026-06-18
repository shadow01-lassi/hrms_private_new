import { pool } from "../lib/db";

export const getRoles = async () => {
    const query = `
        SELECT *
        FROM role_master
        ORDER BY rm_id;
    `;
    const { rows } = await pool.query(query);
    return rows || [];
};

export const getRole = async (rollId: number) => {
    const query = `
        SELECT *
        FROM role_master
        WHERE rm_id = $1;
    `;
    const { rows } = await pool.query(query, [rollId]);
    return rows[0] || null;
};

export const createRole = async (roleName: string, accessArray: number[], description: string) => {
    const access = `{ ${accessArray.join(", ")} }`;
    const query = `
        INSERT into role_master (rm_name, rm_access, rm_description)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [roleName, access, description]);
    return rows;
};

export const editRole = async (rollId: number, roleName: string, accessArray: number[], description: string) => {
    const access = `{ ${accessArray.join(", ")} }`;
    const query = `
        UPDATE role_master
        SET rm_name = $1, 
            rm_access = $2,
            rm_description = $3
        WHERE rm_id = $4
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [roleName, access, description, rollId]);
    return rows;
};