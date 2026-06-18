import { describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";

describe("Password Hashing & Hashing Strength Test", () => {
    it("should securely hash and match passwords", async () => {
        const password = "mySecurePassword123!";
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        expect(hash).toBeDefined();
        expect(hash).not.toBe(password);
        expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);

        const isMatch = await bcrypt.compare(password, hash);
        expect(isMatch).toBe(true);

        const isWrongMatch = await bcrypt.compare("wrongpassword", hash);
        expect(isWrongMatch).toBe(false);
    });
});
