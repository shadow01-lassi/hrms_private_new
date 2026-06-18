import { Request, Response } from "express";
import { getErrorsDAO, logErrorToDB } from "../lib/errorLogger";

export const registerError = async (request: Request, response: Response) => {
    const errorData = request.body;

    // ensure platform defaults to frontend if not provided
    if (!errorData.platform) {
        errorData.platform = "frontend";
    }

    await logErrorToDB(errorData);

    response.status(200).json({
        type: "success",
        message: "Error logged successfully"
    });
};

export const getErrors = async (request: Request, response: Response) => {
    // destructuring the request body
    const { page = 0, pageSize = 250 } = request.body;

    const limit = pageSize;
    const offset = page * pageSize;

    const results = await getErrorsDAO(limit, offset);

    // total_count is attached to each row by the DAO using COUNT(*) OVER()
    const rowCount = results.length > 0 ? parseInt(results[0].total_count) : 0;

    response.status(200).json({
        type: "success",
        message: "Errors fetched successfully",
        data: results,
        rowCount: rowCount
    });
};