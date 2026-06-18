import { Request } from "express";
import { pool } from "./db";

// Helper to remove sensitive fields before logging
const sanitize = (data: any): any => {
    // Return early if null, undefined, or not an object
    if (!data || typeof data !== 'object') return data;

    const sensitiveKeys = ['password', 'token', 'authorization', 'secret'];
    const cleanData = { ...data };

    Object.keys(cleanData).forEach(key => {
        if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
            cleanData[key] = '***REDACTED***';
        }
    });
    return cleanData;
};

export interface AppError extends Error {
    statusCode?: number;
    status?: number;
}

export const logErrorToDB = async (
    arg1: Error | any,
    arg2?: Request
): Promise<void> => {
    try {
        let username = 'unknown';
        let platform = process.env.APP_PLATFORM || 'backend_api';
        let functionName = 'global_handler';
        let errorName = 'UnknownError';
        let errorMessage = 'No error message provided';
        let errorStack = '';
        let httpMethod = 'unknown';
        let endpoint = 'unknown';
        let statusCode = 500;
        let requestBody = {};
        let requestParams = {};
        let requestQuery = {};
        let severity = 'ERROR';

        if (arg1 instanceof Error && arg2) {
            // Traditional (error, req) usage
            const error = arg1;
            const req = arg2;
            username = req.body.username || 'unknown';
            errorName = error.name || 'UnknownError';
            errorMessage = error.message || 'No error message provided';
            errorStack = error.stack || '';
            httpMethod = req.method || 'unknown';
            endpoint = req.originalUrl || req.url || 'unknown';
            statusCode = (error as any).statusCode || (error as any).status || 500;
            requestBody = sanitize(req.body);
            requestParams = sanitize(req.params);
            requestQuery = sanitize(req.query);
            severity = statusCode >= 500 ? 'ERROR' : 'WARNING';
        } else if (typeof arg1 === 'object' && !arg2) {
            // Structured data usage from enterprise handler
            const data = arg1;
            username = data.username || data.userId || 'unknown';
            platform = data.platform || platform;
            functionName = data.functionName || functionName;
            const err = data.error || {};
            errorName = err.name || 'UnknownError';
            errorMessage = err.message || data.message || 'No error message provided';
            errorStack = err.stack || data.stack || '';
            httpMethod = data.httpMethod || 'unknown';
            endpoint = data.endpoint || 'unknown';
            statusCode = data.statusCode || 500;
            requestBody = data.requestBody || {};
            requestParams = data.requestParams || {};
            requestQuery = data.requestQuery || {};
            severity = data.severity || (statusCode >= 500 ? 'ERROR' : 'WARNING');
        }

        const environment = process.env.NODE_ENV || 'development';
        const serverInstance = process.env.HOSTNAME || 'localhost';

        const queryText = `
            INSERT INTO error_logs (
                el_username, el_platform, el_function_name,
                el_error_name, el_error_message, el_error_stack,
                el_http_method, el_endpoint, el_status_code,
                el_request_body, el_request_params, el_request_query,
                el_environment, el_server_instance, el_severity
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            ) RETURNING *;
        `;

        const values = [
            username,
            platform,
            functionName,
            errorName,
            errorMessage,
            errorStack,
            httpMethod,
            endpoint,
            statusCode,
            JSON.stringify(requestBody),
            JSON.stringify(requestParams),
            JSON.stringify(requestQuery),
            environment,
            serverInstance,
            severity,
        ];

        await pool.query(queryText, values);
        // console.log('Error logged successfully');

    } catch (loggingError) {
        console.error('CRITICAL: Database logging failed', loggingError);
    }
};


// Main logging function
export const logError = (error: Error, context: string = "General") => {
    const timestamp = new Date().toISOString();
    const sanitizedError = sanitize(error);

    const logMessage = `
    ========================================
    🚨 ERROR LOG - ${context}
    ========================================
    Timestamp: ${timestamp}
    Error Type: ${error.name}
    Message: ${error.message}
    Stack: ${error.stack}
    Full Error Object: ${JSON.stringify(sanitizedError, null, 2)}
    ========================================
    `;

    // Log to console
    console.error(logMessage);

    // TODO: Add file logging or error tracking service integration here
    // Example: fs.appendFileSync('error.log', logMessage);
};

export async function getErrorsDAO(limit: number = 250, offset: number = 0) {
    const query = `
        SELECT *, COUNT(*) OVER() as total_count 
        FROM error_logs
        ORDER BY el_created_at DESC
        LIMIT $1 OFFSET $2;
    `;
    const { rows } = await pool.query(query, [limit, offset]);
    return rows;
}