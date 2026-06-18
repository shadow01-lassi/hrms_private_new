import express from "express";
import * as permission_controller from "../controllers/permission.controller";
import { requirePermission } from "../middleware/middleware";

const router = express.Router();

router.get("/", requirePermission("user-roles.read"), permission_controller.getPermissions);
router.get("/my", permission_controller.getMyPermissions);
router.get("/role/:rm_id", requirePermission("user-roles.read"), permission_controller.getRolePermissions);
router.post("/create", requirePermission("user-roles.create"), permission_controller.createRole);
router.post("/update", requirePermission("user-roles.update"), permission_controller.updateRolePermissions);

export default router;