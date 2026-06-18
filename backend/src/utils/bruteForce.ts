import { redisClient } from "../lib/redis";
import { monitoringService } from "./monitoring";

const FAILED_ATTEMPTS_LIMIT = 5;
const COOLDOWN_SECONDS = 15 * 60; // 15 minutes as requested

export const bruteForceService = {
    /**
     * Generate a unique key for tracking failed attempts
     */
    getKey(userIdentifier: string, ip: string): string {
        return `bf:${userIdentifier}:${ip}`;
    },

    /**
     * Check if a combination of user identifier and IP is currently blocked
     */
    async isBlocked(userIdentifier: string, ip: string): Promise<boolean> {
        const key = this.getKey(userIdentifier, ip);
        const attempts = await redisClient.get(key);
        return parseInt(attempts || "0") >= FAILED_ATTEMPTS_LIMIT;
    },

    /**
     * Increment the failed attempt counter
     */
    async registerFail(userIdentifier: string, ip: string): Promise<number> {
        const key = this.getKey(userIdentifier, ip);
        const attempts = await redisClient.incr(key);
        if (attempts === 1) {
            await redisClient.expire(key, COOLDOWN_SECONDS);
        }

        // --- Security Monitoring Hook ---
        monitoringService.logSuspiciousEvent('AUTH_FAILURE', ip, {
            userIdentifier,
            attempts
        });

        if (attempts >= FAILED_ATTEMPTS_LIMIT) {
            monitoringService.logSuspiciousEvent('BRUTE_FORCE_ATTEMPT', ip, {
                userIdentifier,
                attempts,
                action: 'Temporarily blocked'
            });
        }

        return attempts;
    },

    /**
     * Reset the counter upon successful authentication
     */
    async reset(userIdentifier: string, ip: string): Promise<void> {
        const key = this.getKey(userIdentifier, ip);
        await redisClient.del(key);
    },

    /**
     * Get remaining time for blocking
     */
    async getRemainingCooldown(userIdentifier: string, ip: string): Promise<number> {
        const key = this.getKey(userIdentifier, ip);
        return await redisClient.ttl(key);
    }
};
