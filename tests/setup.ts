/**
 * Vitest Setup File
 * This runs BEFORE any test file, ensuring browser globals are in place
 * before module-level code in imported files tries to use them.
 *
 * We use Object.defineProperty throughout because in Node 20+ some globals
 * (e.g. navigator, location) are read-only on globalThis and cannot be set
 * via simple assignment.
 */

import { vi } from "vitest";


// ---------------------------------------------------------------------------
// navigator
// ---------------------------------------------------------------------------
const navigatorMock = {
    onLine: true,
    userAgent: "node-test",
    platform: "MacIntel",
};

Object.defineProperty(globalThis, "navigator", {
    value: navigatorMock,
    writable: true,
    configurable: true,
});

// ---------------------------------------------------------------------------
// localStorage / sessionStorage
// ---------------------------------------------------------------------------
const createStorageMock = () => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = String(value);
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
        get length() {
            return Object.keys(store).length;
        },
    };
};

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    configurable: true,
});

Object.defineProperty(globalThis, "sessionStorage", {
    value: sessionStorageMock,
    configurable: true,
});

// ---------------------------------------------------------------------------
// location
// ---------------------------------------------------------------------------
const locationMock = {
    href: "http://localhost/",
    origin: "http://localhost",
    pathname: "/",
    search: "",
    hash: "",
    reload: vi.fn(),
    assign: vi.fn(),
    replace: vi.fn(),
};

Object.defineProperty(globalThis, "location", {
    value: locationMock,
    configurable: true,
});

// ---------------------------------------------------------------------------
// window  (must contain navigator so isMac() works)
// ---------------------------------------------------------------------------
Object.defineProperty(globalThis, "window", {
    value: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        navigator: navigatorMock,
        localStorage: localStorageMock,
        sessionStorage: sessionStorageMock,
        location: locationMock,
        matchMedia: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    },
    writable: true,
    configurable: true,
});

// ---------------------------------------------------------------------------
// setInterval – prevent the heartbeat in api.ts from keeping the Node event
// loop alive and causing the test runner to hang.
//
// When running with --pool=forks (child_process), timer handles expose .unref()
// which marks the timer as non-blocking — the process can exit even while the
// interval is still pending. We wrap setInterval to automatically call .unref()
// on every handle created during tests, so module-level intervals (e.g. the
// heartbeat in api.ts) never prevent the test runner from exiting.
// ---------------------------------------------------------------------------
const _origSetInterval = globalThis.setInterval;
globalThis.setInterval = ((...args: Parameters<typeof setInterval>) => {
    const handle = _origSetInterval(...args);
    if (handle && typeof (handle as any).unref === "function") {
        (handle as any).unref();
    }
    return handle;
}) as typeof setInterval;

console.log("[vitest-setup] Browser globals stubbed.");
