import { Pool, PoolClient, types } from "pg";
import dotenv from "dotenv";
import { logErrorToDB } from "./errorLogger";

dotenv.config();

// Override the default parsing for DATE (OID 1082)
// This ensures that '2025-01-01' stays '2025-01-01' (string) 
// instead of becoming a Date object with a timezone shift.
types.setTypeParser(1082, (stringValue) => {
    return stringValue;
});

// Configure SSL based on DB_SSL or default NODE_ENV
const isSslEnabled = process.env.DB_SSL === "true" || (!process.env.DB_SSL && process.env.NODE_ENV === "production");
const sslConfig = isSslEnabled ? { rejectUnauthorized: false } : undefined;

const poolMax = process.env.DB_POOL_MAX ? Number(process.env.DB_POOL_MAX) : 10;
const poolIdleTimeout = process.env.DB_IDLE_TIMEOUT_MS ? Number(process.env.DB_IDLE_TIMEOUT_MS) : 30000;
const poolConnTimeout = process.env.DB_CONNECTION_TIMEOUT_MS ? Number(process.env.DB_CONNECTION_TIMEOUT_MS) : 5000;

export const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        max: poolMax,
        idleTimeoutMillis: poolIdleTimeout,
        connectionTimeoutMillis: poolConnTimeout,
        keepAlive: true,
        maxUses: 7500,
        ssl: sslConfig
    })
    : new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT),
        max: poolMax,
        idleTimeoutMillis: poolIdleTimeout,
        connectionTimeoutMillis: poolConnTimeout,
        keepAlive: true,
        maxUses: 7500,
        ssl: sslConfig
    });

// Connection state tracking
let isPostgresConnected = false;

// Handle idle connection errors (e.g. dropped network) so they don't crash the Node.js process
pool.on("error", (err, client) => {
    console.error("Unexpected error on idle client:", err);
    isPostgresConnected = false;
    logErrorToDB({
        username: "system_pool",
        platform: "backend_api",
        functionName: "pool_error_handler",
        error: err,
        message: "Unexpected error on idle client (e.g. network dropped).",
        severity: "CRITICAL"
    }).catch(e => console.error("Failed to log critical pool error to DB:", e));
});

/**
 * Standard Query Helper
 */
export const query = (text: string, params?: any[]) => {
    return pool.query(text, params);
};

/**
 * Transaction Execution Helper
 * Handles checkout, BEGIN, COMMIT / ROLLBACK, and release in finally.
 */
export async function withTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (rollbackErr) {
            console.error("Failed to rollback transaction:", rollbackErr);
        }
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Database health check executing a light query
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string; latency?: string; error?: string }> {
    const start = Date.now();
    try {
        await pool.query("SELECT 1");
        isPostgresConnected = true;
        return {
            status: "UP",
            timestamp: new Date().toISOString(),
            latency: `${Date.now() - start}ms`
        };
    } catch (err: any) {
        isPostgresConnected = false;
        return {
            status: "DOWN",
            timestamp: new Date().toISOString(),
            error: err.message
        };
    }
}

/**
 * Database startup test with exponential backoff retries
 */
export async function initDatabase(retries = 5, delay = 1000): Promise<void> {
    if (process.env.NODE_ENV === "test") {
        console.log("⚠️ initDatabase bypassed in test environment");
        return;
    }
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const client = await pool.connect();
            client.release();
            isPostgresConnected = true;
            console.log("✅ Postgres connected successfully");
            
            // Auto-run schema migration for users table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    mobile VARCHAR(50) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Auto-run schema migration for error_logs table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS error_logs (
                    el_id SERIAL PRIMARY KEY,
                    el_username VARCHAR(255),
                    el_platform VARCHAR(100),
                    el_function_name VARCHAR(255),
                    el_error_name VARCHAR(255),
                    el_error_message TEXT,
                    el_error_stack TEXT,
                    el_http_method VARCHAR(10),
                    el_endpoint TEXT,
                    el_status_code INTEGER,
                    el_request_body TEXT,
                    el_request_params TEXT,
                    el_request_query TEXT,
                    el_environment VARCHAR(50),
                    el_server_instance VARCHAR(100),
                    el_severity VARCHAR(50),
                    el_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Auto-run schema migration for hostname_styles table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS hostname_styles (
                    hs_hostname VARCHAR(255) PRIMARY KEY,
                    hs_bg_color VARCHAR(50) NOT NULL,
                    hs_text_color VARCHAR(50) NOT NULL,
                    hs_primary_color VARCHAR(50) NOT NULL,
                    hs_app_name VARCHAR(255) NOT NULL,
                    hs_app_logo TEXT NOT NULL,
                    hs_light_theme_colors JSONB DEFAULT '{}'::jsonb,
                    hs_dark_theme_colors JSONB DEFAULT '{}'::jsonb,
                    hs_last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log("✅ Database schema verified (users, error_logs, and hostname_styles tables exist)");
            return;
        } catch (err: any) {
            console.warn(`Postgres connection attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`);
            if (attempt === retries) {
                isPostgresConnected = false;
                console.error(`❌ Could not connect to Postgres after ${retries} attempts.`);
                console.error("Connection settings parsed:");
                console.error(`  Host: ${process.env.DB_HOST}`);
                console.error(`  Port: ${process.env.DB_PORT}`);
                console.error(`  Database: ${process.env.DB_NAME}`);
                console.error(`  User: ${process.env.DB_USER}`);
                
                if (process.env.NODE_ENV === "production") {
                    throw new Error("Database initialization failed: " + err.message);
                } else {
                    console.warn("⚠️ [DEV MODE] Postgres is offline. Starting server in disconnected state.");
                    return;
                }
            }
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
}


export const DB_USER_CREATE_SCRIPT = `
CREATE ROLE hrms_user
LOGIN
PASSWORD 'hrms_$tr0ng_u$er_P@$$w0rD'
NOSUPERUSER
NOCREATEDB
NOCREATEROLE
NOINHERIT;

GRANT CONNECT ON DATABASE hrms TO hrms_user;
GRANT USAGE, CREATE ON SCHEMA public TO hrms_user;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO hrms_user;

GRANT USAGE, SELECT, UPDATE
ON ALL SEQUENCES IN SCHEMA public
TO hrms_user;

GRANT EXECUTE
ON ALL FUNCTIONS IN SCHEMA public
TO hrms_user;

GRANT EXECUTE
ON ALL PROCEDURES IN SCHEMA public
TO hrms_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLES TO hrms_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT, UPDATE
ON SEQUENCES TO hrms_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT EXECUTE
ON FUNCTIONS TO hrms_user;
`;