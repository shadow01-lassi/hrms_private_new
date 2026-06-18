/**
 * Security Monitoring Service
 * 
 * Provides a lightweight layer to detect, track, and log suspicious activities
 * across the application such as brute-force attempts, rate-limit violations,
 * and abnormal API patterns. Outputs structured JSON tailored for security analysis.
 */

export const monitoringService = {
    /**
     * Log a suspicious security event.
     * 
     * @param type The type of suspicious event (e.g., 'BRUTE_FORCE_ATTEMPT', 'RATE_LIMIT_VIOLATION', 'AUTH_FAILURE')
     * @param ip The IP address originating the request
     * @param metadata Additional context (e.g., endpoint, userIdentifier)
     */
    logSuspiciousEvent(type: string, ip: string, metadata: Record<string, any> = {}): void {
        const eventFormat = {
            timestamp: new Date().toISOString(),
            event_category: 'SECURITY_MONITORING',
            event_type: type,
            ip,
            ...metadata
        };

        // Output as structured JSON so log aggregators can easily parse it
        console.warn(JSON.stringify(eventFormat));
    }
};
