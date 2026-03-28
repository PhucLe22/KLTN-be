import express from "express";
import { staffDeliveryController } from "../../config/di.config.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";

const staffDeliveryRouter = express.Router();

// Staff delivery endpoints - require shipper role
staffDeliveryRouter.use(authenticationMiddleware, authorize("shipper"));

// GET /api/v1/staff/deliveries - Get deliveries for shipper
staffDeliveryRouter.get("/", staffDeliveryController.getDeliveries);
staffDeliveryRouter.put("/:id/status", staffDeliveryController.updateDeliveryStatus);
staffDeliveryRouter.put("/:id/location", staffDeliveryController.updateLocation);

export default staffDeliveryRouter;
