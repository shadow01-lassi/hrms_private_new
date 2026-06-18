import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET_KEY || ""; // Must be 32 characters
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a string using AES-256-CBC.
 * The IV is prepended to the resulting ciphertext.
 * @param text The plain text to encrypt
 */
export function encrypt(text: string): string {
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
        throw new Error("ENCRYPTION_SECRET_KEY must be exactly 32 characters long.");
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

/**
 * Decrypts a string that was encrypted using the above encrypt function.
 * @param text The combined IV and ciphertext in hex format (iv:ciphertext)
 */
export function decrypt(text: string): string {
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
        throw new Error("ENCRYPTION_SECRET_KEY must be exactly 32 characters long.");
    }

    const textParts = text.split(":");
    const ivStr = textParts.shift();
    if (!ivStr) throw new Error("Invalid encrypted text format");
    
    const iv = Buffer.from(ivStr, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}
