import { pool } from "../lib/db";

export async function getBankNamesDAO() {
    const query = `
        SELECT bm_id AS id, bm_name AS name
        FROM bank_master
        ORDER BY bm_name;
    `;
    const { rows } = await pool.query(query);
    if (rows) {
        return rows;
    } else {
        return [];
    }
}

export async function getBankBranchesDAO(bankId: string, q: string) {
    const query = `
        SELECT bd_branch AS branch, bd_ifsc AS ifsc
        FROM bank_details
        WHERE bd_b_id = $1
        AND ($2::text IS NULL OR bd_branch ILIKE '%' || $2 || '%')
        ORDER BY bd_branch
        LIMIT 50;
    `;
    const { rows } = await pool.query(query, [bankId, q || null]);
    return rows;
}

export async function searchIFSCCode(code: string) {
    const query = `
        SELECT 
            bm.bm_name AS bank_name,
            bd.bd_branch AS branch,
            bd.bd_ifsc AS ifsc
        FROM bank_details bd
        JOIN bank_master bm ON bm.bm_id = bd.bd_b_id
        WHERE bd.bd_ifsc = $1
        LIMIT 1;
    `;
    const { rows } = await pool.query(query, [code.toUpperCase()]);
    return rows;
}