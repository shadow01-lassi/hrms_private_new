export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";

    constructor(
        message: string,
        statusCode: number,
        severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL" = "ERROR"
    ) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        this.severity = severity;

        Error.captureStackTrace(this, this.constructor);
    }
}
