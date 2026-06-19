// importing client
import axios, { AxiosRequestConfig } from "axios";

// importing shadcn components
import { toast } from "sonner";

// importing lib
import { logout } from "@/lib/authentication";

// importing constants
import { BACKEND_URL, PLATFORM, APP_VERSION } from "./constants";

// importing storage
import { getFromStorage, putIntoStorage } from "@/lib/storage";

// importing offlineDB
import { enqueueMutation, getGateData, saveGateData, getQueuedMutations, removeMutation } from "@/components/native/offlineDB";

// importing store
import { useNetworkStore } from "@/components/store/networkStore";

// importing encryption
import { encrypt, decrypt, ENCRYPTION_KEY } from "./encryption";

// importing updateStore
import { triggerForcedUpdate } from "@/components/store/updateStore";

/**
 * 🌀 REFRESH QUEUE MANAGEMENT
 * Prevents multiple concurrent refresh calls.
 */
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

/**
 * API Instance Configuration
 * This central Axios instance handles authentication, headers, 
 * and most importantly, transparent offline support.
 */
const api = axios.create({
    baseURL: BACKEND_URL,
    timeout: 10000,
});

/**
 * 🔄 BACKGROUND SYNC LOGIC
 * Periodically or on reconnection, this function iterates through the
 * IndexedDB mutation queue and attempts to process each request.
 */
export const syncOfflineQueue = async () => {
    const isOnline = useNetworkStore.getState().isOnline;
    if (!isOnline) return;

    const store = useNetworkStore.getState();
    if (store.syncing) return; // Prevent concurrent sync runs

    store.setSyncing(true);
    try {
        const mutations = await getQueuedMutations();
        store.setQueueCount(mutations.length);

        for (const req of mutations) {
            try {
                // Attempt to execute the queued request
                await api.request({
                    url: req.url,
                    method: req.method,
                    data: req.body,
                    headers: req.headers
                });
                // Remove from queue on success
                if (req.id !== undefined) {
                    await removeMutation(req.id);
                }
            } catch (err: any) {
                // If the error is a definitive rejection (4xx), remove from queue
                // Otherwise (5xx or timeout), keep it to retry later
                if (err.response && String(err.response.status).startsWith("4")) {
                    if (req.id !== undefined) await removeMutation(req.id);
                }
            }
        }
        store.setQueueCount(0);
    } finally {
        store.setSyncing(false);
    }
};

/**
 * 📡 NETWORK STATE LISTENERS
 * Updates the global zustand store when the browser detects connection changes.
 */
window.addEventListener("online", () => {
    useNetworkStore.getState().setOnline(true);
    syncOfflineQueue(); // Trigger sync immediately on recovery
});
window.addEventListener("offline", () => {
    useNetworkStore.getState().setOnline(false);
});

/**
 * 💓 HEARTBEAT MONITOR
 * A fallback mechanism to ensure network state stays in sync even
 * if window events are missed.
 */
setInterval(() => {
    const store = useNetworkStore.getState();
    if (navigator.onLine) {
        if (!store.isOnline) {
            store.setOnline(true);
            syncOfflineQueue();
        }
    } else {
        if (store.isOnline) {
            store.setOnline(false);
        }
    }
}, 5000);

/**
 * 🛡️ REQUEST INTERCEPTOR
 * Injects JWT, Company headers, and handles transparent encryption.
 */
api.interceptors.request.use((config) => {
    // Set default Content-Type for JSON payloads
    const isFormData = config.data instanceof FormData;
    if (!isFormData) {
        config.headers["Content-Type"] = "application/json";
    }

    // [GLOBAL ENCRYPTION]: Handle headers and payload encryption
    // @ts-ignore - custom flag
    const skipEncryption = config.skipEncryption === true;
    const hasKey = ENCRYPTION_KEY && ENCRYPTION_KEY.length === 32;

    if (hasKey && !skipEncryption) {
        config.headers["x-encrypted"] = "true";
        if (config.data && !isFormData && typeof config.data === "object") {
            try {
                const encryptedPayload = encrypt(JSON.stringify(config.data));
                config.data = { data: encryptedPayload };
            } catch (error) {
                console.error("API Request Encryption Failed:", error);
            }
        }
    }

    // Attach Authentication JWT
    const jwt = getFromStorage("session");
    if (jwt) config.headers.Authorization = `Bearer ${jwt}`;

    // Attach Company filter
    const company = getFromStorage("company");
    if (company !== null && company !== undefined) {
        config.params = { ...config.params, company };
    }

    // Attach flat filter
    const flat = getFromStorage("flat");
    if (flat) {
        config.params = { ...config.params, flat_no: flat };
    }

    // Attach Platform ID for source detection
    if (PLATFORM) {
        config.headers["x-platform-id"] = PLATFORM;
    }

    /**
     * OFFLINE ESCALATION
     * If we are online and trying to POST/PUT/DELETE, we reject the request
     * with a special flag. This rejection is caught by the response interceptor
     * to perform the "Optimistic UI" queuing logic.
     */
    const isOnline = useNetworkStore.getState().isOnline;
    if (!isOnline && config.method && config.method.toUpperCase() !== "GET") {
        return Promise.reject({ mutationOffline: true, config });
    }

    return config;
});

/**
 * 🎯 RESPONSE INTERCEPTOR
 * Handles data caching, error handling (auth, network), and transparent decryption.
 */
api.interceptors.response.use(
    (res) => {
        // [GLOBAL DECRYPTION]: Decrypt incoming JSON responses
        const isEncrypted = res.headers["x-encrypted"] === "true";
        if (isEncrypted && res.data && typeof res.data.data === "string") {
            try {
                const decryptedData = decrypt(res.data.data);
                res.data.data = JSON.parse(decryptedData);
            } catch (error) {
                console.error("API Response Decryption Failed:", error);
            }
        }

        // [VERSION SENTINEL]: Check if a critical update is required
        const minRequiredVersion = res.headers["x-min-app-version"];
        if (minRequiredVersion && minRequiredVersion !== APP_VERSION) {
            // Aggressive push: Notify and force reload if local version is outdated
            if (minRequiredVersion > APP_VERSION) {
                triggerForcedUpdate();
            }
        }

        // [CACHING STRATEGY]: Save successful GET responses to IndexedDB for offline use
        if (res.config.method?.toUpperCase() === "GET" && res.status === 200 && (res.data as any)?.type === "success") {
            saveGateData(res.config.url!, res.data);
        }
        return res;
    },
    async (error) => {
        /**
         * [OFFLINE MUTATION HANDLER]
         * If caught from the request interceptor rejection, we save the action
         * to our local DB and return a fake "success" to keep the UI flowing.
         */
        if (error?.mutationOffline) {
            const { config } = error;
            await enqueueMutation(config.url!, config.method!, config.data, config.headers);
            useNetworkStore.getState().setQueueCount((await getQueuedMutations()).length);
            return { data: { type: "success", data: null, optimistic: true } };
        }

        /**
         * [OFFLINE QUERY FALLBACK]
         * If a GET request fails due to lack of network, we check IndexedDB 
         * for the last known good result and serve it as a successful response.
         */
        const isOnline = useNetworkStore.getState().isOnline;
        if (error.config?.method?.toUpperCase() === "GET" && (!isOnline || !error.response)) {
            const cachedData = await getGateData(error.config.url!);
            if (cachedData) {
                // Return cached version with a special flag
                return { data: { ...cachedData, cached: true }, status: 200, config: error.config, headers: {}, statusText: "OK" };
            }
        }

        // Standard Network Failure Toast
        if (!error.response) {
            toast.error("Couldn't reach server");
            return Promise.reject(error);
        }


        // Session Expiration / Concurrent Login Handling
        const { type, message } = error.response.data || {};
        const originalRequest = error.config;

        /**
         * [SILENT JWT REFRESH]
         * If the access token has expired (401), we attempt to refresh it 
         * using the refreshToken stored in localStorage.
         */
        if (error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, wait for it to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getFromStorage("refreshToken");
            if (refreshToken) {
                try {
                    const res = await axios.post(`${BACKEND_URL}/refresh-token`, { refreshToken });
                    if (res.data.type === "success") {
                        const newAccessToken = res.data.accessToken;
                        putIntoStorage("session", newAccessToken);

                        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
                        processQueue(null, newAccessToken);

                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    logout();
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                isRefreshing = false;
            }
        }

        if (type === "error" && message === "logout") {
            toast.error("Security Session Expired (Another login detected).");
            logout();
        }

        if (error.response.status === 401) {
            console.warn("API 401 Unauthorized caught in interceptor", error.config.url);
        }

        return Promise.reject(error);
    }
);


/**
 * Backward compatibility wrapper.
 * Can be used in components where explicit offline handling is needed.
 */
export const fetchWithOfflineSupport = async <T,>(
    url: string,
    config?: AxiosRequestConfig
): Promise<T> => {
    const res = await api.request<T>({ url, ...config });
    return res.data;
};

export default api;

/**
 * ============================================================================
 * API & OFFLINE INFRASTRUCTURE OVERVIEW (Working Mechanism)
 * ============================================================================
 * 
 * The system operates as a transparent middle-layer using Axios Interceptors.
 * It eliminates the need for components to know about network or session state.
 * 
 * 1. QUERIES (GET):
 *    - IF ONLINE:   Request -> Interceptor -> Decrypt Response -> Cache locally -> Return Success
 *    - IF OFFLINE:  Request -> Interceptor fails -> Load from Local DB -> Return Cached Data
 * 
 * 2. MUTATIONS (POST/PUT/DELETE):
 *    - IF ONLINE:   Request -> Encrypt Payload -> Interceptor -> Server -> Decrypt Response -> Return Success
 *    - IF OFFLINE:  Request -> Interceptor Rejects -> Save to DB Queue -> Return Optimistic Success
 * 
 * 3. GLOBAL ENCRYPTION (AES-256-CBC):
 *    - Requests:    All non-FormData JSON payloads are encrypted with a random IV.
 *    - Responses:   Server returns encrypted payloads which are transparently decrypted.
 *    - Benefit:     Protects PII (Personally Identifiable Information) in transit.
 * 
 * 4. JWT PERSISTENCE (SILENT REFRESH):
 *    - IF 401:      Request fails -> Interceptor catches -> Pause Queue -> POST /refresh-token
 *    - IF SUCCESS:  Update local storage -> Retry original request + Process Queue
 * 
 * ----------------------------------------------------------------------------
 * FLOW DIAGRAM:
 * ----------------------------------------------------------------------------
 * 
 * Standard Request: [api.get / api.post]
 *        |
 *        v
 * [ REQUEST INTERCEPTOR ] ----------------------------------------------+
 *        |                                                              |
 *        +--- [ ENCRYPT PAYLOAD ] (If JSON)                             |
 *        |                                                              |
 *        +--- [ INJECT JWT / COMPANY ]                                  |
 *        |                                                              |
 * (Offline & Mutation?) --- YES ---> [ Response Interceptor (Catch) ]   |
 *        |                                 |                            |
 *       NO                                 v                            |
 *        |                         [ Enqueue in Offline DB ]            |
 *        v                                 |                            |
 *  [ GO TO SERVER ]                [ Return Optimistic Success ]        |
 *        |                                                              |
 *        +--------------------------------------------------------------+
 *        |
 *        v
 * [ RESPONSE INTERCEPTOR ]
 *        |
 *        +--- [ DECRYPT PAYLOAD ] (If Encrypted)
 *        |
 * (401 Unauthorized?) --- YES ---> [ SILENT REFRESH FLOW ]
 *        |                                 |
 *        |                         [ POST /refresh-token ]
 *        |                                 |
 *        |                 (Success?) --- YES ---> [ Update Token & Retry ]
 *        |
 * (Success GET?) --- YES ---> [ Save to Cache (IndexedDB) ] ---> [ Return Data ]
 *        |
 * (Network Failure / Offline GET?) --- YES ---> [ Load from Cache ] ---> [ Return Data (cached: true) ]
 *        |
 *        v
 * [ RETURN ERROR / DEFAULT FLOW ]
 * 
 * ============================================================================
 */
