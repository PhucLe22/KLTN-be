import express from "express";
import { orderController } from "../controllers/order.controller.js";
import { validateData } from "../middlewares/validate.middleware.js";
import { protect, optionalProtect } from "../middlewares/authentication.middleware.js";
import { createOrderInputSchema, getOrderCodeInputSchema, getOrderHistoryInputSchema } from "../contracts/input/order.schema.js";

const orderRouter = express.Router();

/**
 * @route   POST /api/v1/orders
 * @desc    Tạo đơn hàng mới
 * @access  Public (supports both authenticated and guest orders)
 */
orderRouter.post(
  "/",
  optionalProtect, // Optional auth - sets req.user if token provided
  validateData({ body: createOrderInputSchema.body }),
  orderController.create,
);

/**
 * @route   GET /api/v1/orders/code/:orderCode
 * @desc    Lấy đơn hàng theo mã đơn hàng
 * @access  Public
 */
orderRouter.get(
  "/code/:orderCode",
  validateData({ params: getOrderCodeInputSchema.params }),
  orderController.getOrderCode,
);


orderRouter.get(
  "/:id",
  orderController.getOrderById,
);

export default orderRouter;

// /order