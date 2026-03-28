import express from "express";
import { staffOrderController } from "../../config/di.config.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";

const staffOrderRouter = express.Router();

// Staff order endpoints - require staff or manager role
staffOrderRouter.use(authenticationMiddleware, authorize("staff", "manager"));

// POST /api/v1/staff/orders - Create order by staff
staffOrderRouter.post("/", staffOrderController.createOrder);
staffOrderRouter.put("/:id/status", staffOrderController.updateOrderStatus);

export default staffOrderRouter;
