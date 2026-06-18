import { DB_NAME, DB_VERSION } from "@/lib/constants";
import { openDB, DBSchema } from "idb";

interface OfflineDBSchema extends DBSchema {
    offlineQueue: {
        key: number;
        value: {
            id?: number;
            url: string;
            method: string;
            body: any;
            headers: any;
            timestamp: number;
        };
        indexes: {
            "by-timestamp": number;
        };
    };
    residentData: {
        key: string;
        value: {
            key: string;
            data: any;
            timestamp: number;
        };
    };
    syncStorage: {
        key: string;
        value: {
            key: string;
            value: any;
        };
    };
}

export const initDB = async () => {
    return openDB<OfflineDBSchema>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("offlineQueue")) {
                const queueStore = db.createObjectStore("offlineQueue", {
                    keyPath: "id",
                    autoIncrement: true,
                });
                queueStore.createIndex("by-timestamp", "timestamp");
            }
            if (!db.objectStoreNames.contains("residentData")) {
                db.createObjectStore("residentData", { keyPath: "key" });
            }
            if (!db.objectStoreNames.contains("syncStorage")) {
                db.createObjectStore("syncStorage", { keyPath: "key" });
            }
        },
    });
};

export const checkCacheVersion = async () => {
    const db = await initDB();
    const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";
    const storedVersion = localStorage.getItem("RESIDENT_APP_VERSION");

    if (storedVersion && storedVersion !== APP_VERSION) {
        console.log(`Version updated from ${storedVersion} to ${APP_VERSION}. Clearing old caches.`);
        await db.clear("residentData");
    }
    localStorage.setItem("RESIDENT_APP_VERSION", APP_VERSION);
};

// Check version immediately on import
checkCacheVersion();

export const enqueueMutation = async (url: string, method: string, body: any, headers: any) => {
    const db = await initDB();
    await db.add("offlineQueue", {
        url,
        method,
        body,
        headers,
        timestamp: Date.now(),
    });
};

export const getQueuedMutations = async () => {
    const db = await initDB();
    return db.getAllFromIndex("offlineQueue", "by-timestamp");
};

export const removeMutation = async (id: number) => {
    const db = await initDB();
    await db.delete("offlineQueue", id);
};

export const clearMutationQueue = async () => {
    const db = await initDB();
    await db.clear("offlineQueue");
};

export const saveGateData = async (key: string, data: any) => {
    const db = await initDB();
    await db.put("residentData", {
        key,
        data,
        timestamp: Date.now()
    });
};

export const getGateData = async (key: string) => {
    const db = await initDB();
    const result = await db.get("residentData", key);
    return result?.data;
};

// --- SYNC STORAGE METHODS ---

export const saveSyncData = async (key: string, value: any) => {
    const db = await initDB();
    await db.put("syncStorage", {
        key,
        value,
    });
};

export const deleteSyncData = async (key: string) => {
    const db = await initDB();
    await db.delete("syncStorage", key);
};

export const getAllSyncData = async () => {
    const db = await initDB();
    return db.getAll("syncStorage");
};

export const clearAllStores = async () => {
    const db = await initDB();
    await Promise.all([
        db.clear("offlineQueue"),
        db.clear("residentData"),
        db.clear("syncStorage"),
    ]);
};
