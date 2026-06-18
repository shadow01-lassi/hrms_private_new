import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { uploadFile, FileInfo, SUPPORTED_FILE_TYPES, SupportedMimeType } from "../awsS3";
import FileType from "file-type";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit (synced with backend logic)
    },
    fileFilter: (req, file, cb) => {
        // Initial check based on extension/provided mime type
        const isSupported = Object.keys(SUPPORTED_FILE_TYPES).includes(file.mimetype);
        if (isSupported) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${file.mimetype} is not supported.`));
        }
    }
}).single("file");

// Wrapper middleware to handle Multer errors and return JSON
export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            console.error("Multer error:", err);
            return res.status(400).json({
                type: "error",
                message: `Upload error: ${err.message}`,
                code: err.code
            });
        } else if (err) {
            console.error("Unknown upload error:", err);
            return res.status(400).json({
                type: "error",
                message: err.message || "Unknown upload error"
            });
        }
        next();
    });
};

export const uploadImage = async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({
            type: "error",
            message: "No file uploaded"
        });
        return;
    }

    const file = req.file;

    try {
        // SECURITY: Deep Buffer Inspection
        // Use file-type to detect the actual MIME type from the buffer content (magic numbers)
        const detectedType = FileType(file.buffer);

        if (!detectedType) {
            return res.status(400).json({
                type: "error",
                message: "Could not determine file type from content. Upload rejected."
            });
        }

        // SECURITY: Cross-check detected type against supported list
        const fileTypeInfo = SUPPORTED_FILE_TYPES[detectedType.mime as SupportedMimeType];
        if (!fileTypeInfo) {
            console.error("Security Alert: Malicious file upload attempt detected.", {
                providedMime: file.mimetype,
                detectedMime: detectedType.mime,
                filename: file.originalname
            });
            return res.status(400).json({
                type: "error",
                message: `Malicious file content detected. Content of type ${detectedType.mime} is not allowed.`
            });
        }

        // DYNAMIC SIZE LIMIT: 5MB for images, 10MB for documents/others
        const category = fileTypeInfo.category;
        const sizeInMB = file.size / (1024 * 1024);
        const limitMB = category === "image" ? 5 : 10;

        if (sizeInMB > limitMB) {
            return res.status(400).json({
                type: "error",
                message: `File size too large. ${category === "image" ? "Images" : "Files"} are limited to ${limitMB}MB. (Uploaded: ${sizeInMB.toFixed(2)}MB)`
            });
        }

        const fileInfo: FileInfo = {
            name: file.originalname,
            size: file.size,
            type: detectedType.mime, // Use the detected type, not the user-provided one
            lastModified: Date.now()
        };

        const result = await uploadFile(file.buffer, fileInfo, "resort-images");

        res.status(200).json({
            type: "success",
            message: "Image uploaded successfully",
            data: {
                url: result.url,
                key: result.key,
                detectedType: detectedType.mime
            }
        });
    } catch (error) {
        console.error("Upload process error:", error);
        res.status(500).json({
            type: "error",
            message: "Internal server error during upload processing"
        });
    }
};
