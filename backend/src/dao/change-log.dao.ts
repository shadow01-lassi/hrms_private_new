import { pool } from "../lib/db";

export async function getChangeLog() {
    const query = `SELECT * FROM changelog ORDER BY c_date, c_id DESC`;
    const results = await pool.query(query);
    return results.rows;
}

export async function getChangeLogById(id: number) {
    const query = `SELECT * FROM changelog WHERE c_id = $1`;
    const results = await pool.query(query, [id]);
    return results.rows[0];
}

export async function createChangeLog(data: any) {
    const query = `
        INSERT INTO changelog (c_version, c_date, c_title, c_description, c_improvements, c_fixes, c_patches)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;
    const values = [
        data.c_version,
        data.c_date,
        data.c_title,
        data.c_description,
        data.c_improvements || [],
        data.c_fixes || [],
        data.c_patches || []
    ];
    const results = await pool.query(query, values);
    return results.rows[0];
}

export async function updateChangeLog(id: number, data: any) {
    const query = `
        UPDATE changelog
        SET c_version = $1, c_date = $2, c_title = $3, c_description = $4, c_improvements = $5, c_fixes = $6, c_patches = $7
        WHERE c_id = $8
        RETURNING *
    `;
    const values = [
        data.c_version,
        data.c_date,
        data.c_title,
        data.c_description,
        data.c_improvements || [],
        data.c_fixes || [],
        data.c_patches || [],
        id
    ];
    const results = await pool.query(query, values);
    return results.rows[0];
}

export async function deleteChangeLog(id: number) {
    const query = `DELETE FROM changelog WHERE c_id = $1`;
    await pool.query(query, [id]);
}