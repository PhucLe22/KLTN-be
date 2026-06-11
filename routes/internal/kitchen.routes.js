import express from "express";
import { kitchenController } from "../../controllers/kitchen.controller.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { StaffRole } from "../../constants/enum.js";

const kitchenRouter = express.Router();

/**
 * @route   POST /api/v1/internal/kitchen/schedule
 * @desc    Lấy lịch trình chế biến tối ưu từ solver
 * @access  Private (KITCHEN, MANAGER, ADMIN)
 */
kitchenRouter.post(
  "/schedule",
  protect,
  restrictTo(
    StaffRole.KITCHEN,
    StaffRole.MANAGER,
    StaffRole.ADMIN,
    StaffRole.OWNER,
  ),
  kitchenController.getSchedule,
);

/**
 * @route   POST /api/v1/internal/kitchen/delivery-schedule
 * @desc    Lấy lịch trình giao hàng tối ưu từ solver (VRP)
 * @access  Private (MANAGER, ADMIN, OWNER)
 */
kitchenRouter
  .route("/delivery-schedule")
  .get(
    protect,
    restrictTo(
      StaffRole.MANAGER,
      StaffRole.ADMIN,
      StaffRole.OWNER,
      StaffRole.SHIPPER,
    ),
    kitchenController.getDeliverySchedule,
  )
  .post(
    protect,
    restrictTo(StaffRole.MANAGER, StaffRole.ADMIN, StaffRole.OWNER, StaffRole.SHIPPER),
    kitchenController.getDeliverySchedule
  );

export default kitchenRouter;
