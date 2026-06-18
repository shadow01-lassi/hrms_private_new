import { Request, Response } from "express";
import { pool } from "../lib/db";

// 1. Get all reports
export const getAllReports = async (req: Request, res: Response): Promise<void> => {
    const { company, userId } = req.body

    if (!company || !userId) {
        res.status(401).json({
            type: "error",
            message: "Unauthorized"
        });
        return;
    };

    const query = `
        SELECT * FROM query_reports 
        ORDER BY qr_name
    `;
    const result = await pool.query(query, []);

    res.status(200).json(result.rows);

};

// 2. Execute a report with parameters
export const executeReport = async (req: Request, res: Response): Promise<void> => {
    const { params, page = 1, pageSize = 10, company, userId } = req.body;
    const reportId = req.params.id;

    if (!company || !userId) {
        res.status(401).json({
            type: "error",
            message: "Unauthorized"
        });
        return;
    };

    // Get the report definition
    const reportQuery = `SELECT qr_sql_query FROM query_reports WHERE qr_id = $1`;
    const reportResult = await pool.query(reportQuery, [reportId]);

    if (reportResult.rows.length === 0) {
        res.status(404).json({
            type: "error",
            message: "Report not found"
        });
        return;
    }

    let sqlQuery = reportResult.rows[0].qr_sql_query;

    // Convert named parameters to positional parameters
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

    // Count total rows
    const countQuery = `SELECT COUNT(*) FROM (${sqlQuery}) AS subquery`;
    const countResult = await pool.query({
        text: countQuery,
        values: paramValues
    });
    const totalCount = parseInt(countResult.rows[0].count);

    // Add pagination
    const paginatedQuery = {
        text: `${sqlQuery} LIMIT $${paramValues.length + 1} OFFSET $${paramValues.length + 2}`,
        values: [...paramValues, pageSize, (page - 1) * pageSize]
    };

    // Execute query
    const result = await pool.query(paginatedQuery);

    res.status(200).json({
        columns: result.fields.map(field => field.name),
        rows: result.rows,
        totalCount
    });

};

// 3. Execute a query for List of Values (LOV)
export const executeLovQuery = async (req: Request, res: Response): Promise<void> => {
    const { company, userId, query } = req.body;

    if (!company || !userId) {
        res.status(401).json({
            type: "error",
            message: "Unauthorized"
        });
        return;
    };

    if (!query) {
        res.status(400).json({
            type: "error",
            message: "Query parameter is required"
        });
        return;
    }

    // Validate that the query is a SELECT query
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery.startsWith('SELECT')) {
        res.status(400).json({
            type: "error",
            message: "Only SELECT queries are allowed"
        });
        return;
    }

    // Execute query and get only the data we need
    const result = await pool.query(query);

    // Define types for our row and field parameters
    type QueryRow = Record<string, any>;
    type QueryField = { name: string };

    // Extract just the column names and rows
    const responseData = {
        columns: result.fields.map((field: QueryField) => field.name),
        rows: result.rows.map((row: QueryRow) => {
            // Convert each row to an array of values (maintaining column order)
            return result.fields.map((field: QueryField) => row[field.name]);
        })
    };

    res.status(200).json(responseData);

};

// 4. Get a single report definition
export const getReportDefinition = async (req: Request, res: Response): Promise<void> => {
    const { company, userId } = req.body
    const reportId = req.params.id;

    if (!company || !userId) {
        res.status(401).json({
            type: "error",
            message: "Unauthorized"
        });
        return;
    };

    const query = `
        SELECT * FROM query_reports 
        WHERE qr_id = $1
    `;
    const result = await pool.query(query, [reportId]);

    if (result.rows.length === 0) {
        res.status(404).json({
            type: "error",
            message: "Report not found"
        });
        return;
    }

    res.status(200).json(result.rows[0]);

};