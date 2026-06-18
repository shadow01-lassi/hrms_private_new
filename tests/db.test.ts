import { afterAll, describe, expect, it, vi } from "vitest";

// Mock pg entirely to ensure the config test does not make a real database connection
vi.mock("pg", () => {
    const mockPoolConstructor = vi.fn().mockImplementation((config) => {
        return {
            options: config,
            on: vi.fn(),
            query: vi.fn(),
            connect: vi.fn(),
            end: vi.fn().mockResolvedValue(undefined),
        };
    });
    return {
        Pool: mockPoolConstructor,
        types: {
            setTypeParser: vi.fn(),
        },
    };
});

describe("Database Configuration Sanity Test", () => {
    afterAll(async () => {
        const { pool } = await import("../backend/src/lib/db");
        await pool.end();
    });

    it("should load configuration from environment", async () => {
        // Clear conflicting env first
        delete process.env.DATABASE_URL;

        // Set mock env
        process.env.DB_HOST = "localhost";
        process.env.DB_USER = "test_user";
        process.env.DB_NAME = "test_db";
        process.env.DB_PASSWORD = "test_password";
        process.env.DB_PORT = "5432";

        const { pool } = await import("../backend/src/lib/db");
        expect(pool).toBeDefined();
        expect(pool.options.host).toBe("localhost");
        expect(pool.options.user).toBe("test_user");
        expect(pool.options.database).toBe("test_db");
    }, 60000);
});
