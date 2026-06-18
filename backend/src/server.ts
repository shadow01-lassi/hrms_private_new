import "./utils/logger";
import "express-async-errors";
import express, { Request, Response } from "express";
import cors from "cors";
import os from "os";
import { config } from "dotenv";
import bodyParser from "body-parser";
import session from "express-session";
import cookieParser from "cookie-parser";
import { detectPlatform } from "./middleware/middleware";
import globalErrorHandler from "./controllers/utils/globalErrorController";
import { initRedis } from "./lib/redis";
import morgan from "morgan";
import statusMonitor from "express-status-monitor";
import compression from "compression";
import { requestLoggerMiddleware } from "./middleware/logger.middleware";
import { securityHeadersMiddleware } from "./middleware/securityHeaders";
import { xssMiddleware } from "./middleware/xss.middleware";
import { initDatabase, pool } from "./lib/db";

// Handle process-level errors early
process.on("uncaughtException", (err: Error) => {
    console.error("UNCAUGHT EXCEPTION! 💥", err);
    process.exit(1);
});

process.on("unhandledRejection", (err: any) => {
    console.error("UNHANDLED REJECTION! 💥", err);
    process.exit(1);
});

// Graceful shutdown listener
const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
    try {
        await pool.end();
        console.log("✅ PostgreSQL pool closed.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error during pool shutdown:", err);
        process.exit(1);
    }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

config();
const app = express();
const port = process.env.PORT || 5056;

// Trust proxy for correct request.hostname if behind Nginx/ALB
app.set("trust proxy", true);

// Apply compression middleware
app.use(
    compression({
        threshold: 1024 // compress only if response > 1kb
    })
);

// Apply status monitor middleware
app.use(statusMonitor());

// Apply timeout middleware
app.use((req, res, next) => {
    res.setTimeout(60000, () => {
        if (!res.headersSent) {
            res.status(408).send("Request timeout");
        }
    });
    next();
});

// List of allowed origins
const allowedOrigins = [
    "https://conversations.valueye.in",
    "https://conversational-ai.valueye.in",
    "http://localhost:3020",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
];

// Apply CORS middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.indexOf(origin) !== -1 ||
            origin.startsWith('http://10.0.2.2') ||
            origin.startsWith('http://192.168.') ||
            origin.includes('localhost') ||
            origin.includes('ngrok-free.dev');

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`[CORS Blocked] Origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-platform-id", "x-company-email", "x-onboarding-token", "x-encrypted"],
    exposedHeaders: ["x-encrypted", "x-min-app-version"],
}));

// Apply standard Morgan logger for general request logging
app.use(
    morgan(":method :url :status :response-time ms - :res[content-length]")
);

// Apply Request Logging FIRST to capture all incoming requests
app.use(requestLoggerMiddleware);

// Apply security headers middleware
app.use(securityHeadersMiddleware);

// Apply XSS Protection to all incoming requests
app.use(xssMiddleware);

app.use(cookieParser());
app.use(session({
    secret: process.env.JWT_SECRET as string,
    saveUninitialized: true,
    resave: true
}));

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Global Platform Detection
app.use(detectPlatform);

// Global Encryption/Decryption Middleware
import { encryptionMiddleware } from "./middleware/encryption.middleware";
app.use(encryptionMiddleware);

// ========================================================
// ⚡ DHRUV ONE-SHOT BYPASS: DIRECT MOCK LOGIN FOR DEMO ⚡
// ========================================================
/*
app.post("/api/login", (req, res) => {
    console.log("🚀 Dhruv Bypass Triggered! Sending plain response...");
    return res.status(200).json({
        type: "success",
        success: true,
        message: "Login successful",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummytoken",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummytoken",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummytoken",
        user: {
            id: 1, em_id: 1, el_id: 1, el_cm_id: 1, el_em_id: 1,
            username: "admin", el_username: "admin",
            name: "Dhruv Bhanushali", el_name: "Dhruv Bhanushali",
            role: 1, el_role: 1, active: true, el_active: true
        },
        permissions: ["ALL"],
        company: {
            cm_id: 1,
            cm_name: "Valueye Solutions",
            cm_status: true
        },
        data: {
            id: 1,
            name: "Dhruv Bhanushali",
            flatNo: "",
            societyId: 0,
            role: 1,
            accessType: "AD",
            permissions: ["ALL"]
        }
    });
});
*/
// ===========================================
// |               AUTH ROUTES               |
// ===========================================

import appRouter from "./super-router/app.router";

app.use("/api", appRouter);

// Health check
app.get("/health", (request: Request, response: Response) => {
    const healthData = {
        status: "UP",
        timestamp: new Date().toISOString(),
        process: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            pid: process.pid,
        },
        os: {
            platform: os.platform(),
            release: os.release(),
            type: os.type(),
            uptime: os.uptime(),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            loadAvg: os.loadavg(),
            cpus: os.cpus().length,
        },
        redis: {
            connected: initRedis !== undefined, // Basic check if helper is imported
        }
    };

    console.log("🏥 Health Check Context:", JSON.stringify(healthData, null, 2));
    response.status(200).json(healthData);
});

app.get("/", (request: Request, response: Response) => {
    response.send("Welcome to Valueye Technologies - The Society App!");
});

app.use(globalErrorHandler);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);

    // Connect to services in the background (non-blocking)
    initRedis().catch((err: any) => {
        console.error("Redis initialization error:", err.message);
    });

    initDatabase().catch((err: any) => {
        console.error("Database initialization error:", err.message);
        if (process.env.NODE_ENV === "production") {
            process.exit(1);
        }
    });
});