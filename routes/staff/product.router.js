import express from "express";
import { staffProductController } from "../../config/di.config.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";

const staffProductRouter = express.Router();

// Staff product endpoints - require staff or manager role
staffProductRouter.use(authenticationMiddleware, authorize("staff", "manager"));

// PUT /api/v1/staff/products/:id/stock - Update product stock
staffProductRouter.put("/:id/stock", staffProductController.updateStock);
staffProductRouter.get("/:id/availability", staffProductController.checkAvailability);

export default staffProductRouter;
