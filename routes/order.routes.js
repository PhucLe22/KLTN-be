import express from "express";
import { orderController } from "../controllers/order.controller.js";
import { validateData } from "../middlewares/validate.middleware.js";
import { protect, optionalProtect } from "../middlewares/authentication.middleware.js";
import { createOrderSchema as inputCreateOrderSchema, getOrderCodeSchema as inputGetOrderCodeSchema, getOrderHistorySchema as inputGetOrderHistorySchema } from "../contracts/input/order.schema.js";

const orderRouter = express.Router();

/**
 * @route   POST /api/v1/orders
 * @desc    Tạo đơn hàng mới
 * @access  Public (supports both authenticated and guest orders)
 */
orderRouter.post(
  "/",
  optionalProtect, // Optional auth - sets req.user if token provided
  validateData({ body: inputCreateOrderSchema.body }),
  orderController.create,
);

/**
 * @route   GET /api/v1/orders/code/:orderCode
 * @desc    Lấy đơn hàng theo mã đơn hàng
 * @access  Public
 */
orderRouter.get(
  "/code/:orderCode",
  validateData({ params: inputGetOrderCodeSchema.params }),
  orderController.getOrderCode,
);

/**
 * @route   GET /api/v1/orders/history
 * @desc    Lấy lịch sử đơn hàng của khách hàng
 * @access  Private (Customer)
 */
orderRouter.get(
  "/history",
  protect,
  validateData({ query: inputGetOrderHistorySchema.query }),
  orderController.getOrderHistory,
);

orderRouter.get(
  "/:id",
  orderController.getOrderById,
);

export default orderRouter;

// /order