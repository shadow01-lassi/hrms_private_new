import express from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as role_controller from "../controllers/role.controller";
import { requirePermission } from "../middleware/middleware";

const roleRouter = express.Router();

roleRouter.get('/', requirePermission("user-roles.read"), asyncHandler(role_controller.getExistingRoles));
roleRouter.post('/', requirePermission("user-roles.read"), asyncHandler(role_controller.getExistingRole));
roleRouter.post('/create', requirePermission("user-roles.create"), asyncHandler(role_controller.createNewRole));
roleRouter.post('/edit', requirePermission("user-roles.update"), asyncHandler(role_controller.editExistingRole));

export default roleRouter;