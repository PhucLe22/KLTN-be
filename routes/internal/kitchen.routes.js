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
  restrictTo(StaffRole.KITCHEN, StaffRole.MANAGER, StaffRole.ADMIN, StaffRole.OWNER),
  kitchenController.getSchedule
);

export default kitchenRouter;
