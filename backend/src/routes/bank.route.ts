import { Router } from "express";
import * as bank_controller from "../controllers/bank.controller";
import { asyncHandler } from "../utils/asyncHandler";

const bankRouter = Router();

/**
 * GET /api/banks
 * Returns a list of all banks.
 */
bankRouter.get("/", asyncHandler(bank_controller.getBankNames));

/**
 * GET /api/banks/:bankId/branches?q=
 * Returns branches for a specific bank with optional search.
 */
bankRouter.get("/:bankId/branches", asyncHandler(bank_controller.getBankBranches));

/**
 * GET /api/banks/ifsc/:code
 * Returns bank and branch details for a specific IFSC code.
 */
bankRouter.get("/ifsc/:code", asyncHandler(bank_controller.searchIFSCCode));

export default bankRouter;
