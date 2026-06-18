import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as upload_controller from "../controllers/upload.controller";
import { upload } from "../lib/multer";

const router = Router();

router.post("/image", upload.single("file"), asyncHandler(upload_controller.uploadImage));

export default router;
