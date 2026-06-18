import { describe, expect, it, vi } from "vitest";



import { NAV_LINKS, REDIRECT_WHEN_JWT_EXISTS, REDIRECT_WHEN_JWT_EXPIRED } from "../frontend/src/lib/constants";

describe("Navigation & Route Configuration Test", () => {
    it("should define standard redirect configurations correctly", () => {
        expect(REDIRECT_WHEN_JWT_EXISTS).toBe("/dashboard");
        expect(REDIRECT_WHEN_JWT_EXPIRED).toBe("/login");
    });

    it("should contain valid NAV_LINKS layout definitions", () => {
        expect(NAV_LINKS).toBeDefined();
        expect(Array.isArray(NAV_LINKS)).toBe(true);
        expect(NAV_LINKS.length).toBeGreaterThan(0);

        for (const nav of NAV_LINKS) {
            expect(nav).toHaveProperty("label");
            expect(nav).toHaveProperty("link");
            expect(nav.link.startsWith("/") || nav.link.startsWith("http")).toBe(true);
        }
    });
});
