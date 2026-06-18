import { Request, Response } from "express"
import * as rep_dao from "../dao/report.dao";
import { pool } from "../lib/db";

export const getStandardReport = async (request: Request, response: Response) => {
    const reportId = Number(request.query.qr_id);

    let reportData = [];
    if (reportId) {
        reportData = await rep_dao.getOneStandardReportDAO(reportId);
    } else {
        reportData = await rep_dao.getStandardReportDAO()
    }

    if (!reportData) {
        throw new Error("Cannot respond! check your internet connection")
    }

    response.status(200).json({ type: "success", message: "", data: reportData });
}

export const executeReport = async (req: Request, res: Response): Promise<void> => {
    const { params, page = 1, pageSize = 10 } = req.body;
    const reportId = req.params.id;

    const results = await rep_dao.executeQueryDAO(params, Number(reportId), page, pageSize);

    res.status(200).json({
        data: results.data,
        count: results.count
    });
}

export const executeLovQuery = async (req: Request, res: Response): Promise<void> => {
    const { company, userId, query } = req.body

    if (!company || !userId) {
        res.status(401).json({
            type: "error",
            message: "Query parameter is required"
        });
        return;
    };

    // Validate that the query is a SELECT query
    if (!query.trim().toUpperCase().startsWith('SELECT') || !query.trim().startsWith('WITH')) {
        res.status(400).json({
            type: "error",
            message: "Only SELECT or WITH queries are allowed"
        });
        return;
    }

    const result = await pool.query(query);
    console.log(result);
    res.status(200).json({
        columns: result.fields.map((field: { name: string }) => field.name),
        rows: result.rows
    });
};

export const getQueryReport = async (request: Request, response: Response) => {
    const {
        data,
        limit,
        offset,
        id
    } = request.body;

    const newResults = await rep_dao.executeQueryDAO(data, Number(id), Number(offset), Number(limit));

    response.status(200).json({ message: "The data fetched successfully", data: newResults.data, count: newResults.count })
}


export const getContentByQuery = async (request: Request, response: Response) => {
    const { query, value } = request.query;

    const result = await rep_dao.fetchDataByQuery(String(query), String(value))

    if (!result) {
        throw new Error("Error fething report!")
    }

    response.status(200).json({ message: "The data fetched successfully", data: result })
}