import CryptoJS from "crypto-js";

// Vite uses import.meta.env instead of process.env
export const ENCRYPTION_KEY = import.meta.env?.VITE_ENCRYPTION_SECRET_KEY || ""; 

/**
 * Encrypts a string using AES-256-CBC.
 * The IV is randomly generated and prepended to the ciphertext.
 */
export function encrypt(text: string): string {
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
        // We log error but don't throw to prevent crashing the whole app in development if key is missing
        console.error("VITE_ENCRYPTION_SECRET_KEY must be 32 chars.");
        return text; 
    }

    const iv = CryptoJS.lib.WordArray.random(16);
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
    
    const encrypted = CryptoJS.AES.encrypt(text, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return iv.toString(CryptoJS.enc.Hex) + ":" + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}

/**
 * Decrypts a string encrypted by the above function.
 */
export function decrypt(combined: string): string {
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
        return combined;
    }

    try {
        const parts = combined.split(":");
        if (parts.length !== 2) return combined;

        const iv = CryptoJS.enc.Hex.parse(parts[0]);
        const ciphertext = CryptoJS.enc.Hex.parse(parts[1]);
        const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);

        const decrypted = CryptoJS.AES.decrypt(
            // @ts-ignore - lib expects CipherParams or string
            { ciphertext: ciphertext },
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption failed:", error);
        return combined;
    }
}
