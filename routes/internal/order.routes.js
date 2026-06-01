import express from "express";
import { orderController } from "../../controllers/order.controller.js";
import { validateData } from "../../middlewares/validate.middleware.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { StaffRole } from "../../constants/enum.js";
import {
  createStaffOrderSchema,
  updateOrderStatusSchema,
} from "../../contracts/input/order.schema.js";

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
  orderController.createOrderForStaff,
);

orderRouter.get("/", protect, orderController.getOrderForStaff);

/**
 * @route   PATCH /internal/orders/:id/status
 * @desc    Cập nhật trạng thái đơn hàng (staff/manager/admin)
 * @access  Private (Internal only)
 */
orderRouter.patch(
  "/:id/status",
  protect,
  restrictTo(
    StaffRole.CASHIER,
    StaffRole.MANAGER,
    StaffRole.ADMIN,
    StaffRole.OWNER,
    StaffRole.KITCHEN,
  ),
  validateData(updateOrderStatusSchema),
  orderController.updateStatus,
);

export default orderRouter;