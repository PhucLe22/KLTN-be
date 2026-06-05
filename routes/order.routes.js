import express from "express";
import { orderController } from "../controllers/order.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/authentication.middleware.js";
import {
  createOrder,
  getOrderCode,
  getOrders,
} from "../contracts/input/order.schema.js";

const orderRouter = express.Router();

/**
 * @route   POST /api/v1/orders
 * @desc    Táo don hàng mowi
 * @access  Private (Customer authentication required)
 */

// api name
orderRouter.post(
  "/",
  protect,
  validate(createOrder),
  orderController.create,
);

/**
 * @route   GET /api/v1/orders/code/:orderCode
 * @desc    Lấy đơn hàng theo mã đơn hàng
 * @access  Public
 */
orderRouter.get(
  "/code/:orderCode",
  validate(getOrderCode),
  orderController.showByCode,
);

/**
 * @route   GET /api/v1/orders
 * @desc    Lấy danh sách đơn hàng theo store
 * @access  Private (Customer authentication required)
 */
orderRouter.get(
  "/",
  protect,
  validate(getOrders),
  orderController.list,
);

export default orderRouter;
