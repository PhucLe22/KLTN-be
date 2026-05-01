import express from "express";
import { orderController } from "../controllers/order.controller.js";
import { validateData } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/authentication.middleware.js";
import { createOrderSchema as inputCreateOrderSchema, createGuestOrderSchema, getOrderCodeSchema as inputGetOrderCodeSchema } from "../contracts/input/order.schema.js";

const orderRouter = express.Router();

/**
 * @route   POST /api/v1/orders
 * @desc    Táo don hàng mowi
 * @access  Private (Customer authentication required)
 */
orderRouter.post(
  "/",
  protect,
  validateData({ body: inputCreateOrderSchema.body }),
  orderController.createOrder,
);

/**
 * @route   POST /api/v1/orders/guest
 * @desc    Tạo đơn hàng cho khách vãng lai (không cần đăng nhập)
 * @access  Public
 */
orderRouter.post(
  "/guest",
  validateData({ body: createGuestOrderSchema.body }),
  orderController.createOrder,
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
 * @route   GET /api/v1/orders
 * @desc    Lấy danh sách đơn hàng theo store
 * @access  Private (Customer authentication required)
 */
orderRouter.get(
  "/",
  protect,
  orderController.getOrders,
);

export default orderRouter;
