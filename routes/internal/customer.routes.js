import express from "express";
import { customerController } from "../../controllers/customer.controller.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { UserType } from "../../constants/enum.js";

const customerRouter = express.Router();

/**
 * @route   GET /api/v1/internal/customers/search
 * @desc    Tìm kiếm khách hàng theo tên hoặc số điện thoại
 * @access  Private (Cần Access Token - Nhân viên)
 */
customerRouter.get(
  "/search",
  protect,
  restrictTo(UserType.STAFF),
  customerController.search,
);

export default customerRouter;
