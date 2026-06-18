import express from "express";

import * as master_controller from "../controllers/master.controller";

import * as company_controller from "../controllers/company.controller";
import { asyncHandler } from "../utils/asyncHandler";
import bankRouter from "./bank.route";
import employeeRouter from "./employee.route";

const masterRouter = express.Router();

masterRouter.get("/company-master/all", asyncHandler(company_controller.getUserCompany));
masterRouter.get("/company-master", asyncHandler(company_controller.getAllCompanyMaster));
masterRouter.get("/company-master/dropdown", asyncHandler(company_controller.getCompanyMasterDropdown));
masterRouter.get("/company-master/:id", asyncHandler(company_controller.getCompanyMasterById));
masterRouter.post("/company-master", asyncHandler(company_controller.createCompanyMaster));
masterRouter.put("/company-master/:id", asyncHandler(company_controller.updateCompanyMaster));
masterRouter.patch("/company-master/:id/deactivate", asyncHandler(company_controller.deactivateCompanyMaster));
masterRouter.get("/company", asyncHandler(company_controller.getCompanyForSetup));
masterRouter.put("/company", asyncHandler(company_controller.updateCompanyFromSetup));

// bank routes
masterRouter.use("/banks", bankRouter);

// employee routes
masterRouter.use("/employees", employeeRouter);

export default masterRouter;