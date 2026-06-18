// types/otp.ts
export interface OTPData {
    otp: string;
    userId: string;
    email: string;
    expiresAt: Date;
    attempts: number;
    verified: boolean;
}

// utils/otpManager.ts
export class OTPManager {
    private otpStore: Map<string, OTPData>;
    private readonly OTP_EXPIRY_MINUTES = 10;
    public readonly MAX_ATTEMPTS = 3;

    constructor() {
        this.otpStore = new Map<string, OTPData>();
        // Clean up expired OTPs every 5 minutes
        setInterval(() => this.cleanupExpiredOTPs(), 5 * 60 * 1000);
    }

    /**
     * Generate and store a new OTP for a user
     */
    generateOTP(userId: string, email: string): string {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

        const otpData: OTPData = {
            otp,
            userId,
            email,
            expiresAt,
            attempts: 0,
            verified: false
        };

        // Remove any existing OTP for this user
        this.removeOTP(userId);

        // Store new OTP
        this.otpStore.set(userId, otpData);

        return otp;
    }

    /**
     * Verify an OTP for a user
     */
    verifyOTP(userId: string, otp: string): boolean {
        const otpData = this.otpStore.get(userId);

        // Check if OTP exists and is not expired
        if (!otpData || this.isExpired(otpData.expiresAt)) {
            return false;
        }

        // Check if max attempts reached
        if (otpData.attempts >= this.MAX_ATTEMPTS) {
            this.removeOTP(userId);
            return false;
        }

        // Increment attempts
        otpData.attempts++;

        // Verify OTP
        if (otpData.otp === otp) {
            otpData.verified = true;
            return true;
        }

        return false;
    }

    /**
     * Get OTP data for a user (for debugging or admin purposes)
     */
    getOTPData(userId: string): OTPData | null {
        const data = this.otpStore.get(userId);
        return data && !this.isExpired(data.expiresAt) ? data : null;
    }

    /**
     * Remove OTP for a user (useful for manual cleanup)
     */
    removeOTP(userId: string): boolean {
        return this.otpStore.delete(userId);
    }

    /**
     * Check if an OTP is expired
     */
    private isExpired(expiresAt: Date): boolean {
        return new Date() > expiresAt;
    }

    /**
     * Clean up expired OTPs from memory
     */
    private cleanupExpiredOTPs(): void {
        const now = new Date();
        for (const [userId, otpData] of this.otpStore.entries()) {
            if (now > otpData.expiresAt) {
                this.otpStore.delete(userId);
            }
        }
    }

    /**
     * Get all active OTPs (for monitoring purposes)
     */
    getAllActiveOTPs(): OTPData[] {
        const active: OTPData[] = [];
        const now = new Date();

        for (const otpData of this.otpStore.values()) {
            if (now <= otpData.expiresAt) {
                active.push(otpData);
            }
        }

        return active;
    }
}