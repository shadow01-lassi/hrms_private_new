import express from "express";
import * as employee_controller from "../controllers/employee.controller";
import { asyncHandler } from "../utils/asyncHandler";

const employeeRouter = express.Router();

employeeRouter.get("/", asyncHandler(employee_controller.getAllEmployees));
employeeRouter.get("/:id", asyncHandler(employee_controller.getEmployeeById));
employeeRouter.post("/", asyncHandler(employee_controller.createEmployee));
employeeRouter.post("/quick-create", asyncHandler(employee_controller.quickCreateEmployee));
employeeRouter.put("/:id", asyncHandler(employee_controller.updateEmployee));
employeeRouter.patch("/:id/status", asyncHandler(employee_controller.updateEmployeeStatus));

export default employeeRouter;
