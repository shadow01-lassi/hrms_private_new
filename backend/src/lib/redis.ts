import type { createClient as createClientType } from "redis";
import { Request, Response, NextFunction } from "express";
import { CACHE_PREFIX } from "../constants";

// In-memory Mock Redis Client for local fallback
class MockRedisClient {
    private store = new Map<string, { value: string; expiresAt: number | null }>();
    public isOpen = true;
    public isReady = true;
    private eventListeners: { [key: string]: Function[] } = {};

    on(event: string, callback: Function) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
        if (event === "connect") {
            process.nextTick(() => callback());
        }
        return this;
    }

    async connect() {
        this.isOpen = true;
        this.isReady = true;
        if (this.eventListeners["connect"]) {
            this.eventListeners["connect"].forEach(cb => cb());
        }
    }

    async get(key: string): Promise<string | null> {
        const item = this.store.get(key);
        if (!item) return null;
        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }

    async set(key: string, value: string, options?: { EX?: number }) {
        let expiresAt: number | null = null;
        if (options?.EX) {
            expiresAt = Date.now() + options.EX * 1000;
        }
        this.store.set(key, { value, expiresAt });
        return "OK";
    }

    async del(keyOrKeys: string | string[]) {
        const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
        let deleted = 0;
        for (const key of keys) {
            if (this.store.delete(key)) deleted++;
        }
        return deleted;
    }

    async keys(pattern: string): Promise<string[]> {
        const regexStr = "^" + pattern.replace(/\*/g, ".*") + "$";
        const regex = new RegExp(regexStr);
        const matched: string[] = [];
        for (const key of this.store.keys()) {
            const item = this.store.get(key);
            if (item && item.expiresAt && Date.now() > item.expiresAt) {
                this.store.delete(key);
                continue;
            }
            if (regex.test(key)) {
                matched.push(key);
            }
        }
        return matched;
    }

    async incr(key: string): Promise<number> {
        const val = await this.get(key);
        let num = val ? Number(val) : 0;
        if (isNaN(num)) num = 0;
        num++;
        await this.set(key, String(num));
        return num;
    }

    async expire(key: string, seconds: number): Promise<number> {
        const item = this.store.get(key);
        if (!item) return 0;
        item.expiresAt = Date.now() + seconds * 1000;
        return 1;
    }

    async ttl(key: string): Promise<number> {
        const item = this.store.get(key);
        if (!item) return -2;
        if (item.expiresAt === null) return -1;
        const remaining = Math.round((item.expiresAt - Date.now()) / 1000);
        if (remaining < 0) {
            this.store.delete(key);
            return -2;
        }
        return remaining;
    }
}

const fallbackClient = new MockRedisClient();
let activeClient: any = fallbackClient;

const listeners: { [event: string]: Function[] } = {};

function addGlobalListener(event: string, callback: Function) {
    if (!listeners[event]) {
        listeners[event] = [];
    }
    listeners[event].push(callback);
    if (activeClient && typeof activeClient.on === "function") {
        activeClient.on(event, callback);
    }
}

// Proxy to delegate calls to activeClient
export const redisClient = new Proxy({}, {
    get(target, prop) {
        if (prop === "on") {
            return (event: string, callback: Function) => {
                addGlobalListener(event, callback);
                return redisClient;
            };
        }
        const value = activeClient[prop as any];
        if (typeof value === "function") {
            return value.bind(activeClient);
        }
        return value;
    },
    set(target, prop, value) {
        activeClient[prop as any] = value;
        return true;
    }
}) as unknown as ReturnType<typeof createClientType>;

export const rateLimit = (limit: number, windowSeconds: number) => {
    return async (request: Request, response: Response, next: NextFunction) => {
        try {
            const key = `rate:${request.body.username}:${request.path}`;
            const current = await redisClient.incr(key);

            if (current === 1) {
                await redisClient.expire(key, windowSeconds);
            }

            if (current > limit) {
                response.status(429).json({
                    type: "error",
                    message: `Too many requests. Try after ${windowSeconds} seconds`,
                });
                return;
            }

            next();
        } catch (err) {
            console.error("Rate limiter error", err);
            next(); // fail open
        }
    };
};

// Original connect & error logs
redisClient.on("connect", () => {
    console.log("🟢 Redis connected");
});

redisClient.on("error", (err: any) => {
    console.error("❌ Redis error:", err.message);
});

export const initRedis = async () => {
    if (process.env.DISABLE_REDIS === "true") {
        console.warn("⚠️ Redis disabled/unavailable, using in-memory fallback");
        activeClient = fallbackClient;
        return;
    }

    try {
        console.log("Loading redis package dynamically...");
        const redisModule = await import("redis");
        console.log("Creating real Redis client...");
        const realClient = redisModule.createClient({
            socket: {
                host: process.env.REDIS_HOST || "127.0.0.1",
                port: Number(process.env.REDIS_PORT) || 6379,
            },
            ...(process.env.NODE_ENV === "production" && process.env.REDIS_PASSWORD
                ? { password: process.env.REDIS_PASSWORD }
                : {}),
        });

        // Bind all existing event listeners to the new client
        for (const event of Object.keys(listeners)) {
            for (const cb of listeners[event]) {
                realClient.on(event, cb as any);
            }
        }

        await realClient.connect();
        console.log("🟢 Redis client connected successfully via initRedis");

        activeClient = realClient;

        const cacheKeys = await realClient.keys(CACHE_PREFIX + "*");
        if (cacheKeys.length > 0) {
            await realClient.del(cacheKeys);
        }
        console.log(`🧹 Selective Redis flush complete: ${cacheKeys.length} keys removed`);

    } catch (err: any) {
        console.warn("⚠️ Redis disabled/unavailable, using in-memory fallback");
        activeClient = fallbackClient;
    }
};

export const isRedisReady = () => activeClient.isReady;