import express from "express";
import { orderController } from "../../controllers/order.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { StaffRole } from "../../constants/enum.js";
import {
  createStaffOrder,
  updateOrderStatus,
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
  restrictTo(StaffRole.CASHIER, StaffRole.MANAGER, StaffRole.KITCHEN),
  validate(createStaffOrder),
  orderController.createForStaff,
);

orderRouter.get("/", protect, orderController.listForStaff);

/**
 * @route   GET /internal/orders/store/:storeId
 * @desc    Lấy danh sách đơn hàng theo storeId (cho staff/manager/admin)
 * @access  Private (Staff authentication required)
 */
orderRouter.get("/store/:storeId", protect, orderController.listByStoreId);

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
  validate(updateOrderStatus),
  orderController.updateStatus,
);

/**
 * @route   PATCH /internal/orders/:id/pickup
 * @desc    Shipper xác nhận đã lấy hàng
 * @access  Private (SHIPPER only)
 */
orderRouter.patch(
  "/:id/pickup",
  protect,
  restrictTo(StaffRole.SHIPPER),
  orderController.confirmPickup,
);

/**
 * @route   PATCH /internal/orders/:id/complete
 * @desc    Shipper xác nhận đã giao hàng thành công
 * @access  Private (SHIPPER only)
 */
orderRouter.patch(
  "/:id/complete",
  protect,
  restrictTo(StaffRole.SHIPPER),
  orderController.completeDelivery,
);

export default orderRouter;
