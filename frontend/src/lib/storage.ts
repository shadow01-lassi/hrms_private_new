import secureLocalStorage from "react-secure-storage";
import { saveSyncData, deleteSyncData, getAllSyncData } from "../components/native/offlineDB";

// Memory cache for synchronous access across all modules
// This is the source of truth for the active session and configuration
const memoryStorageMap = new Map<string, any>();

/**
 * [INIT STORAGE]
 * Loads all persistent data from IndexedDB into memory on app startup.
 * Crucial for breaking circular dependencies between API intercepts and utils.
 */
export async function initPersistentStorage() {
    try {
        const allData = await getAllSyncData();
        allData.forEach(item => {
            memoryStorageMap.set(item.key, item.value);
        });

        // Migration from legacy secureLocalStorage
        const keysToMigrate = ["session", "company", "app_style", "companies", "finYears", "selectedFinYear", "fy", "onboarding_session"];
        for (const key of keysToMigrate) {
            if (!memoryStorageMap.has(key)) {
                const val = secureLocalStorage.getItem(key);
                if (val !== null) {
                    console.log(`Migrating ${key} from localStorage to IndexedDB`);
                    putIntoStorage(key, val);
                }
            }
        }
    } catch (error) {
        console.error("Failed to initialize persistent storage:", error);
    }
}

export function getFromStorage(value: string) {
    let data = memoryStorageMap.get(value);

    // Fallback to localStorage if memory cache is empty
    if (data === null || data === undefined) {
        data = secureLocalStorage.getItem(value);
        if (data !== null && data !== undefined) {
            memoryStorageMap.set(value, data);
        }
    }

    return data ?? null;
}

export function putIntoStorage(name: string, value: string | object | number | boolean) {
    memoryStorageMap.set(name, value);
    // Sync to secureLocalStorage for immediate persistence (fallback)
    secureLocalStorage.setItem(name, value);
    // Background sync to IndexedDB
    return saveSyncData(name, value).catch(err => {
        console.error(`Sync error for ${name}:`, err);
        throw err;
    });
}

export function deleteFromStorage(name: string) {
    memoryStorageMap.delete(name);
    // Background sync to IndexedDB (non-blocking)
    deleteSyncData(name).catch(err => console.error(`Delete sync error for ${name}:`, err));
}
