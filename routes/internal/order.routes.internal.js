import express from "express";
import { orderController } from "../../controllers/order.controller.js";
import { validateData } from "../../middlewares/validate.middleware.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { StaffRole } from "../../constants/enum.js";
import { createStaffOrderSchema } from "../../contracts/input/order.schema.js";

const orderRouter = express.Router();

/**
 * @route   POST /internal/orders
 * @desc    Tạo đơn hàng cho khách tại quầy (cashier/manager)
 * @access  Private (Staff authentication required)
 */
orderRouter.post(
  "/",
  protect,
  restrictTo(StaffRole.CASHIER, StaffRole.MANAGER),
  validateData({ body: createStaffOrderSchema.body }),
  orderController.createOrder,
);

/**
 * @route   POST /internal/orders/guest
 * @desc    Tạo đơn hàng cho khách vãng lai (cashier/manager)
 * @access  Private (Staff authentication required)
 */
// orderRouter.post("/guest", protect, orderController.createOrder);

orderRouter.get("/", protect, orderController.getOrderForStaff);

export default orderRouter;