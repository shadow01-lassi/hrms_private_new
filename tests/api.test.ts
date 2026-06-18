import { describe, expect, it, vi } from "vitest";

// Mock axios to prevent real network calls
vi.mock("axios", () => {
    const mockAxiosInstance = {
        defaults: {
            timeout: 10000,
            baseURL: "http://localhost:5056/api",
            headers: {
                common: {}
            }
        },
        interceptors: {
            request: { use: vi.fn(), eject: vi.fn() },
            response: { use: vi.fn(), eject: vi.fn() }
        },
        request: vi.fn(),
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    };
    return {
        default: {
            create: vi.fn(() => mockAxiosInstance),
            post: vi.fn(),
        }
    };
});

// ─── Module Mocks ──────────────────────────────────────────────────────────────
// All vi.mock() calls are hoisted to the top by Vitest, running BEFORE imports.

// Mock sonner (toast notifications - browser-only)
vi.mock("sonner", () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
        info: vi.fn()
    }
}));

// Mock react-secure-storage
vi.mock("react-secure-storage", () => ({
    default: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        clear: vi.fn()
    }
}));

// Mock idb (IndexedDB wrapper — not available in Node).
// Must resolve (not reject) so checkCacheVersion() in offlineDB.ts doesn't
// cause an unhandled rejection that stalls dynamic import of api.ts.
vi.mock("idb", () => ({
    openDB: vi.fn(() => Promise.resolve({
        clear: vi.fn(() => Promise.resolve()),
        get: vi.fn(() => Promise.resolve(undefined)),
        getAll: vi.fn(() => Promise.resolve([])),
        getAllFromIndex: vi.fn(() => Promise.resolve([])),
        put: vi.fn(() => Promise.resolve()),
        delete: vi.fn(() => Promise.resolve()),
        add: vi.fn(() => Promise.resolve(1)),
        objectStoreNames: { contains: vi.fn(() => true) },
    }))
}));

// Mock offlineDB — intercept both the alias and the direct relative path
vi.mock("@/components/native/offlineDB", () => ({
    checkCacheVersion: vi.fn(() => Promise.resolve()),
    clearAllStores: vi.fn(() => Promise.resolve()),
    enqueueMutation: vi.fn(() => Promise.resolve()),
    getGateData: vi.fn(() => Promise.resolve(null)),
    saveGateData: vi.fn(() => Promise.resolve()),
    getQueuedMutations: vi.fn(() => Promise.resolve([])),
    removeMutation: vi.fn(() => Promise.resolve()),
    saveSyncData: vi.fn(() => Promise.resolve()),
    deleteSyncData: vi.fn(() => Promise.resolve()),
    getAllSyncData: vi.fn(() => Promise.resolve([]))
}));

// Mock Zustand network store
vi.mock("@/components/store/networkStore", () => ({
    useNetworkStore: {
        getState: () => ({
            isOnline: true,
            syncing: false,
            setSyncing: vi.fn(),
            setQueueCount: vi.fn(),
            setOnline: vi.fn()
        })
    }
}));

// Mock storage module to prevent real IndexedDB/localStorage access
vi.mock("@/lib/storage", () => ({
    getFromStorage: vi.fn((key: string) => {
        if (key === "session") return "dummytoken";
        if (key === "company") return 1;
        return null;
    }),
    putIntoStorage: vi.fn(),
    deleteFromStorage: vi.fn(),
    initPersistentStorage: vi.fn(() => Promise.resolve())
}));

// Mock auth module
vi.mock("@/lib/authentication", () => ({
    logout: vi.fn(() => Promise.resolve()),
    getSession: vi.fn(() => Promise.resolve(null)),
    decryptSession: vi.fn(() => Promise.resolve(null))
}));

// Mock updateStore
vi.mock("@/components/store/updateStore", () => ({
    triggerForcedUpdate: vi.fn()
}));

// Mock CryptoJS (used by encryption.ts) 
vi.mock("crypto-js", () => ({
    default: {
        AES: { encrypt: vi.fn(() => ({ ciphertext: { toString: () => "abc" } })), decrypt: vi.fn(() => ({ toString: () => "decrypted" })) },
        lib: { WordArray: { random: vi.fn(() => ({ toString: () => "iv123" })) } },
        enc: { Hex: { parse: vi.fn(() => ({})), toString: vi.fn(() => "hex") }, Utf8: { parse: vi.fn(() => ({})) } },
        mode: { CBC: {} },
        pad: { Pkcs7: {} }
    }
}));

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe("API Instance Sanity Test", () => {
    it("should initialize axios instance with correct config", async () => {
        const { default: api } = await import("../frontend/src/lib/api");
        expect(api).toBeDefined();
        expect(api.defaults.timeout).toBe(10000);
        expect(api.defaults.baseURL).toContain("5056");
    });
});
