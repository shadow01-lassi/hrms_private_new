import fs from "fs";
import path from "path";
import readline from "readline";

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

// Create an interface to read lines from standard input (stdin)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

// Process each line of output
rl.on("line", (line) => {
    // Print the line to standard output so it still shows on the terminal / Docker logs
    console.log(line);

    // Append the line to the day-wise log file (stripping ANSI color codes)
    const timestamp = new Date().toISOString();
    // eslint-disable-next-line no-control-regex -- intentional: strip ANSI terminal colour codes before writing to file
    const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, "");
    const logLine = `[${timestamp}] ${cleanLine}\n`;

    fs.appendFile(getLogFilePath(), logLine, (err) => {
        if (err) {
            process.stderr.write(`Error writing to daily log file: ${err.message}\n`);
        }
    });
});
