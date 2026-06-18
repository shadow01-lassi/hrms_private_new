import fs from "fs";
import path from "path";

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Function to get the log file path for the current date
const getLogFilePath = () => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return path.join(logsDir, `logs-${today}.log`);
};

// Keep references to the original console methods
const originalLog = console.log;
const originalInfo = console.info;
const originalWarn = console.warn;
const originalError = console.error;

/**
 * Utility to write logs in-process to the daily file
 */
function writeLogToFile(level: string, ...args: any[]) {
    try {
        const message = args
            .map(arg => {
                if (typeof arg === "object") {
                    try {
                        return JSON.stringify(arg, null, 2);
                    } catch {
                        return String(arg);
                    }
                }
                return String(arg);
            })
            .join(" ");

        const timestamp = new Date().toISOString();
        // Strip ANSI escape codes (used for console coloring)
        // eslint-disable-next-line no-control-regex -- intentional: strip ANSI terminal colour codes before writing to file
        const cleanMessage = message.replace(/\x1b\[[0-9;]*m/g, "");
        const logLine = `[${timestamp}] [${level}] ${cleanMessage}\n`;

        fs.appendFile(getLogFilePath(), logLine, (err) => {
            if (err) {
                process.stderr.write(`[Logger Error] Failed to write to log file: ${err.message}\n`);
            }
        });
    } catch (e: any) {
        process.stderr.write(`[Logger Error] Exception during logging: ${e.message}\n`);
    }
}

// Override console methods to write to file while preserving standard output
console.log = (...args: any[]) => {
    originalLog(...args);
    writeLogToFile("INFO", ...args);
};

console.info = (...args: any[]) => {
    originalInfo(...args);
    writeLogToFile("INFO", ...args);
};

console.warn = (...args: any[]) => {
    originalWarn(...args);
    writeLogToFile("WARN", ...args);
};

console.error = (...args: any[]) => {
    originalError(...args);
    writeLogToFile("ERROR", ...args);
};

console.log("📝 In-process file logging initialized.");
