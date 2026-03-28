import express from "express";
import { adminStaffController } from "../../config/di.config.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";

const adminStaffRouter = express.Router();

// Admin staff management endpoints - require admin role
adminStaffRouter.use(authenticationMiddleware, authorize("admin"));

// CRUD for staff
adminStaffRouter.get("/", adminStaffController.getAllStaffs);
adminStaffRouter.post("/", adminStaffController.createStaff);
adminStaffRouter.get("/:id", adminStaffController.getStaffById);
adminStaffRouter.put("/:id", adminStaffController.updateStaff);
adminStaffRouter.delete("/:id", adminStaffController.deleteStaff);

export default adminStaffRouter;
