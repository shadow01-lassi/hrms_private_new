import express from "express";
import * as open_controller from "../controllers/open.controller";
import * as change_log_controller from "../controllers/change-log.controller";
import { requirePermission, verifyToken } from "../middleware/middleware";

const openRouter = express.Router();

// FORM SUBMISSIONS
openRouter.post("/submission", open_controller.submissionController);

// NEWSLETTER
openRouter.post("/newsletter/subscribe", open_controller.newsletterSubscribeController);
openRouter.post("/newsletter/verify", open_controller.newsletterVerifyController);
openRouter.post("/newsletter/unsubscribe", open_controller.newsletterUnsubscribeController);

// CHANGE LOGS
openRouter.get("/change-log", change_log_controller.getChangeLogController);
openRouter.get("/change-log/:id", verifyToken, requirePermission("changelog.read"), change_log_controller.getChangeLogByIdController);
openRouter.post("/change-log", verifyToken, requirePermission("changelog.create"), change_log_controller.createChangeLogController);
openRouter.put("/change-log/:id", verifyToken, requirePermission("changelog.update"), change_log_controller.updateChangeLogController);
openRouter.delete("/change-log/:id", verifyToken, requirePermission("changelog.delete"), change_log_controller.deleteChangeLogController);

export default openRouter;