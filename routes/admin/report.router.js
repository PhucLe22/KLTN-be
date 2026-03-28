import express from "express";
import { adminReportController } from "../../config/di.config.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";

const adminReportRouter = express.Router();

// Admin report endpoints - require admin role
adminReportRouter.use(authenticationMiddleware, authorize("admin"));

// Report endpoints

adminReportRouter.get("/revenue", adminReportController.getRevenueReport);
adminReportRouter.get("/top-products", adminReportController.getTopProducts);

export default adminReportRouter;
