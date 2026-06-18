import { Request, Response, NextFunction } from "express";
import multer from "multer";

const storage = multer.memoryStorage(); // Files are stored in memory as Buffer
export const upload = multer({ storage });

// Multiple files for SOS reports
export const sosUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit 
    },
    fileFilter: (req, file, cb) => {
        // Any natively captured blob from Safari/iOS/Chrome is allowed implicitly to bypass missing MIME bugs
        cb(null, true);
    }
}).array("mediaFiles", 5);


// Multiple files for Offer Banners
const offerUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"));
        }
    }
}).array("banner_images", 3); // Support up to 3 banner images

export function uploadSosMediaMiddleware(request: Request, response: Response, next: NextFunction) {
    sosUpload(request, response, (err: any) => {
        if (err instanceof multer.MulterError) {
            console.error("SOS Multer error:", err);
            response.status(400).json({
                type: "error",
                message: `Media upload error: ${err.message}`,
                code: err.code
            });
            return;
        } else if (err) {
            console.error("Unknown SOS upload error:", err);
            response.status(400).json({
                type: "error",
                message: err.message || "Unknown upload error"
            });
            return;
        } else {
            next();
        }
    });
};


export const uploadOfferMiddleware = (req: Request, res: Response, next: NextFunction) => {
    offerUpload(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            console.error("Offer Multer error:", err);
            return res.status(400).json({
                type: "error",
                message: `Banner upload error: ${err.message}`,
                code: err.code
            });
        } else if (err) {
            console.error("Unknown Offer upload error:", err);
            return res.status(400).json({
                type: "error",
                message: err.message || "Unknown upload error"
            });
        }
        next();
    });
};