import express from "express";
import { orderController } from "../controllers/order.controller.js";
import { validateData } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/authentication.middleware.js";
import { restrictTo } from "../middlewares/authorize.middleware.js";
import { StaffRole } from "../constants/enum.js";
import { createOrderSchema as inputCreateOrderSchema, getOrderCodeSchema as inputGetOrderCodeSchema, getOrderHistorySchema as inputGetOrderHistorySchema } from "../contracts/input/order.schema.js";

const orderRouter = express.Router();

/**
 * @route   POST /api/v1/orders
 * @desc    Tạo đơn hàng mới
 * @access  Public (có thể thêm auth middleware sau)
 */
orderRouter.post(
  "/",
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
 * @desc    Lấy lịch sử đơn hàng theo store (chỉ Admin/Manager)
 * @access  Private (Admin/Manager)
 */
orderRouter.get(
  "/history",
  protect,
  restrictTo(StaffRole.ADMIN, StaffRole.MANAGER),
  validateData({ query: inputGetOrderHistorySchema.query }),
  orderController.getOrderHistory,
);

export default orderRouter;
