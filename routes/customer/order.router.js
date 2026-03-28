import express from "express";
import { customerOrderController } from "../../config/di.config.js";

const customerOrderRouter = express.Router();

// Customer order endpoints
// POST /api/v1/orders - Create order
// GET /api/v1/orders/history - Get order history
// GET /api/v1/orders/:id - Get order by ID

customerOrderRouter.post("/", customerOrderController.createOrder);
customerOrderRouter.get("/history", customerOrderController.getOrderHistory);
customerOrderRouter.get("/:id", customerOrderController.getOrderById);

export default customerOrderRouter;
