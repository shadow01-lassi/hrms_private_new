import { redisClient } from "./redis";

export const TTL = {
    MASTER_LONG: 60 * 60 * 24 * 14, // 14d
    MASTER: 60 * 60 * 24,           // 24h
    CONFIG: 60 * 60 * 10,           // 10h
    MICRO: 60 * 60 * 0.5,           // 30m
    AUTH: 60 * 60 * 24 * 30,        // 30d
    TRANSACTIONS: 60 * 60 * 1,      // 1h
};

export async function getCache<T>(key: string): Promise<T | null> {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
}

function isNonEmpty(data: any): boolean {
    if (data === null || data === undefined) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === "object") return Object.keys(data).length > 0;
    return true; // Keep primitives like strings, numbers, booleans
}

export async function setCache(
    key: string,
    value: unknown,
    ttlSeconds: number
) {
    if (!isNonEmpty(value)) return;

    await redisClient.set(key, JSON.stringify(value), {
        EX: ttlSeconds,
    });
}

export async function getOrSetCache<T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>
): Promise<T> {
    if (!redisClient.isReady) {
        return fetcher();
    }

    const cached = await redisClient.get(key);
    if (cached) {
        console.log("Serving from cache!");
        return JSON.parse(cached) as T;
    }

    const freshData = await fetcher();

    // fire-and-forget cache set (don’t block response)
    if (isNonEmpty(freshData)) {
        redisClient.set(key, JSON.stringify(freshData), {
            EX: ttlSeconds,
        }).catch(console.error);
    }

    return freshData;
}

export async function deleteByPattern(pattern: string) {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
        await redisClient.del(keys);
    }
}

export async function deleteCache(key: string) {
    await redisClient.del(key);
}