import { pool } from "../lib/db";
import { customReplaceAll } from "../utils";

export const getStandardReportDAO = async () => {
    const query = `
        SELECT qr_id, qr_name, qr_desc, qr_type, qr_category
        FROM query_reports;
    `;
    const { rows } = await pool.query(query);
    return rows || [];
}

export const getOneStandardReportDAO = async (reportId: number) => {
    const query = `SELECT get_query_report_with_lov($1) AS report`;
    const { rows } = await pool.query(query, [reportId]);
    return rows[0]?.report;
};

export const executeQueryDAO = async (params: string[], reportId: number, offset: number, limit: number) => {
    const reportQuery = `SELECT qr_sql_query FROM query_reports WHERE qr_id = $1;`;
    const reportResult = await pool.query(reportQuery, [reportId]);
    if (reportResult.rows.length === 0) {
        throw new Error("No such report found!");
    }
    let sqlQuery = reportResult.rows[0].qr_sql_query;

    const paramValues = [];
    if (params && sqlQuery.includes(':')) {
        let paramIndex = 1;
        for (const [key, value] of Object.entries(params)) {
            if (sqlQuery.includes(`:${key}`)) {
                sqlQuery = sqlQuery.replace(new RegExp(`:${key}`, 'g'), `$${paramIndex}`);
                paramValues.push(value);
                paramIndex++;
            }
        }
    }

    const cleanQuery = customReplaceAll(sqlQuery, ";", " ");

    const paginatedQuery = {
        text: `${cleanQuery} LIMIT $${paramValues.length + 1} OFFSET $${paramValues.length + 2}`,
        values: [...paramValues, limit, offset]
    };

    const countQuery = `SELECT COUNT(*) FROM (${cleanQuery}) AS count`;
    const countResult = await pool.query({
        text: countQuery,
        values: paramValues
    });

    const totalCount = parseInt(countResult.rows[0].count);
    const { rows } = await pool.query(paginatedQuery.text, paginatedQuery.values);

    return { data: rows, count: totalCount };
}

export const fetchComplaintsCount = async (date: string) => {
    const query = `
        SELECT
            COUNT(*) FILTER (WHERE DATE(ccd_created_at) = $1) AS created_rows,
            COUNT(*) FILTER (WHERE DATE(ccd_assign_datetime) = $1) AS assigned_rows,
            COUNT(*) FILTER (WHERE DATE(ccd_solved_date) = $1) AS solved_rows
        FROM customer_complaint_details;
    `;
    const { rows } = await pool.query(query, [date]);
    return rows[0];
}

export const fetchMainReport = async (data: any, query: string, arrLength: number, limit: number, offset: number) => {
    const value = [];
    for (let i = 0; i < arrLength; i++) {
        value.push(data[`param${i + 1}`] ? data[`param${i + 1}`].split("::")[0] : null);
    }

    let q = query.replace(";", ' ');
    q += ` limit ${limit} offset ${offset};`;

    const { rows } = await pool.query(q, value);
    return rows || [];
}

export const fetchDataByQuery = async (query: string, value: string) => {
    const { rows } = await pool.query(query, [`%${value}%`]);
    return rows || [];
}