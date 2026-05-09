import express from "express";
import { orderController } from "../controllers/order.controller.js";
import { validateData } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/authentication.middleware.js";
import { restrictTo } from "../middlewares/authorize.middleware.js";
import { createOrderSchema as inputCreateOrderSchema, getOrderCodeSchema as inputGetOrderCodeSchema } from "../contracts/input/order.schema.js";

const orderRouter = express.Router();

/**
 * @route   POST /api/v1/orders
 * @desc    Táo don hàng mowi
 * @access  Private (Customer authentication required)
 */

// customer --> customer has data --> error

// staff --> customer has data --> ok / no

// FE auth --> customer has data --> ok 

// domain --> basic calculation

// api name
orderRouter.post(
  "/",
  protect,
  validateData({ body: inputCreateOrderSchema.body }),
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



