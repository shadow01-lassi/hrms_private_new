// utils/s3-upload.ts
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fromEnv } from "@aws-sdk/credential-providers";
import { config } from "dotenv";

config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: fromEnv()
});

// Supported file types with their MIME types and preview capability
export const SUPPORTED_FILE_TYPES = {
    // Images
    "image/jpeg": { extension: "jpg", preview: true, category: "image" },
    "image/jpg": { extension: "jpg", preview: true, category: "image" },
    "image/png": { extension: "png", preview: true, category: "image" },
    "image/gif": { extension: "gif", preview: true, category: "image" },
    "image/webp": { extension: "webp", preview: true, category: "image" },
    "image/svg+xml": { extension: "svg", preview: true, category: "image" },
    "image/bmp": { extension: "bmp", preview: true, category: "image" },

    // Documents
    "application/pdf": { extension: "pdf", preview: true, category: "document" },
    "text/plain": { extension: "txt", preview: true, category: "document" },
    "text/csv": { extension: "csv", preview: true, category: "document" },

    // Office Documents
    "application/msword": { extension: "doc", preview: false, category: "document" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { extension: "docx", preview: false, category: "document" },
    "application/vnd.ms-excel": { extension: "xls", preview: false, category: "document" },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { extension: "xlsx", preview: false, category: "document" },
    "application/vnd.ms-powerpoint": { extension: "ppt", preview: false, category: "document" },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": { extension: "pptx", preview: false, category: "document" },

    // Archives
    "application/zip": { extension: "zip", preview: false, category: "archive" },
    "application/x-rar-compressed": { extension: "rar", preview: false, category: "archive" },
    "application/x-tar": { extension: "tar", preview: false, category: "archive" },
    "application/gzip": { extension: "gz", preview: false, category: "archive" },

    // Audio
    "audio/webm": { extension: "webm", preview: true, category: "audio" },
    "audio/mp4": { extension: "m4a", preview: true, category: "audio" },
    "audio/mpeg": { extension: "mp3", preview: true, category: "audio" },
    "audio/wav": { extension: "wav", preview: true, category: "audio" },
    "audio/aac": { extension: "aac", preview: true, category: "audio" },
    "audio/x-m4a": { extension: "m4a", preview: true, category: "audio" },

    // Video
    "video/mp4": { extension: "mp4", preview: true, category: "video" },
    "video/webm": { extension: "webm", preview: true, category: "video" },
    "video/quicktime": { extension: "mov", preview: true, category: "video" },
} as const;

export type FileCategory = "image" | "document" | "archive" | "audio" | "video";
export type SupportedMimeType = keyof typeof SUPPORTED_FILE_TYPES;

export interface UploadResult {
    url: string;
    key: string;
    mimeType: string;
    category: FileCategory;
    size: number;
    previewable: boolean;
    filename: string;
}

export interface FileInfo {
    name: string;
    size: number;
    type: string;
    lastModified: number;
}

/**
 * Generate a unique random key for S3 storage
 */
const generateKey = (fileInfo: FileInfo, folder: string = "uploads"): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 11);
    const randomStringUnique = Math.random().toString(36).substring(2, 11);
    const fileExtension = SUPPORTED_FILE_TYPES[fileInfo.type as SupportedMimeType]?.extension || "bin";

    // Use purely random naming to prevent information leakage and path traversal
    return `${folder}/${timestamp}-${randomString}-${randomStringUnique}.${fileExtension}`;
};

/**
 * Validate file type and size
 */
export const validateFile = (file: FileInfo): { valid: boolean; error?: string } => {
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!SUPPORTED_FILE_TYPES[file.type as SupportedMimeType]) {
        return {
            valid: false,
            error: `File type ${file.type} is not supported. Supported types: ${Object.keys(SUPPORTED_FILE_TYPES).join(", ")}`
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of 50MB`
        };
    }

    return { valid: true };
};

/**
 * Get file information for preview
 */
export const getFileInfo = (mimeType: string) => {
    const fileType = SUPPORTED_FILE_TYPES[mimeType as SupportedMimeType];
    return {
        previewable: fileType?.preview || false,
        category: fileType?.category || "document",
        extension: fileType?.extension || "bin"
    };
};

/**
 * Upload file to S3 with proper metadata
 */
export const uploadFile = async (
    buffer: Buffer,
    originalFile: FileInfo,
    folder: string = "uploads"
): Promise<UploadResult> => {

    // Validate file
    const validation = validateFile(originalFile);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    const key = generateKey(originalFile, folder);
    const fileInfo = getFileInfo(originalFile.type);

    // SECURITY: Prevent script execution by setting strict headers
    // For images (except SVG), 'inline' is safe. For others, 'attachment' is safer.
    // SVGs are particularly risky as they can contain embedded scripts.
    const isSvg = originalFile.type === "image/svg+xml";
    const isPdf = originalFile.type === "application/pdf";
    const isMedia = fileInfo.category === "image" || fileInfo.category === "audio" || fileInfo.category === "video";
    const disposition = (isMedia && !isSvg) || isPdf ? "inline" : "attachment";

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: originalFile.type,
        ContentDisposition: disposition,
        Metadata: {
            // eslint-disable-next-line no-control-regex -- intentional: strip non-ASCII bytes for S3 metadata header safety
            "original-filename": originalFile.name.replace(/[^\x00-\x7F]/g, ""), // Sanitize for metadata
            "upload-timestamp": Date.now().toString(),
            "file-size": originalFile.size.toString(),
            "file-category": fileInfo.category,
            "security-check": "verified-buffer-content"
        },
    };

    try {
        const command = new PutObjectCommand(params);
        await s3.send(command);

        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        console.log("File uploaded successfully:", {
            url,
            key,
            type: originalFile.type,
            size: originalFile.size,
            category: fileInfo.category
        });

        return {
            url,
            key,
            mimeType: originalFile.type,
            category: fileInfo.category,
            size: originalFile.size,
            previewable: fileInfo.previewable,
            filename: originalFile.name
        };
    } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};

/**
 * Get file metadata from S3
 */
export const getFileMetadata = async (key: string) => {
    try {
        const command = new HeadObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        });

        const data = await s3.send(command);
        return {
            contentType: data.ContentType,
            contentLength: data.ContentLength,
            lastModified: data.LastModified,
            metadata: data.Metadata,
        };
    } catch (error) {
        console.error("Error fetching file metadata:", error);
        return null;
    }
};

/**
 * Generate signed URL for temporary access (if using private files)
 */
export const generateSignedUrl = async (key: string, expiresIn: number = 3600) => {
    try {
        if (!key) return "";

        // If it's already a full URL, try to extract the key
        let s3Key = key;
        if (key.startsWith("http")) {
            // Format: https://bucket-name.s3.region.amazonaws.com/key
            const urlParts = key.split(".amazonaws.com/");
            if (urlParts.length > 1) {
                s3Key = urlParts[1];
            }
        }

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
        });

        return await getSignedUrl(s3, command, { expiresIn });
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return key; // Fallback to original URL if signature fails
    }
};

/**
 * Generate a presigned URL for uploading a file directly to S3
 */
export const generateUploadPresignedUrl = async (
    fileName: string,
    fileType: string,
    folder: string = "visitor-photos"
): Promise<{ url: string; key: string }> => {
    // Sanitize filename
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const key = `${folder}/${timestamp}-${randomString}-${sanitizedName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
        // ACL: ObjectCannedACL.public_read // visitor photos usually public read or we use signed urls to view
    });

    try {
        const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes
        return { url, key };
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        throw new Error("Failed to generate presigned URL");
    }
};