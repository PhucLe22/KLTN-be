import express from "express";
import { voucherController } from "../../controllers/voucher.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { StaffRole } from "../../constants/enum.js";
import {
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from "../../contracts/input/promotions.schema.js";

const voucherRouter = express.Router();

// All internal voucher routes are protected and restricted to ADMIN/OWNER/MANAGER
voucherRouter.use(protect);
voucherRouter.use(restrictTo(StaffRole.ADMIN, StaffRole.OWNER, StaffRole.MANAGER));

/**
 * @route   POST /api/v1/internal/vouchers
 * @desc    Tạo voucher mới
 */
voucherRouter.post(
  "/",
  validate(createVoucher),
  voucherController.create,
);

/**
 * @route   PATCH /api/v1/internal/vouchers/:id
 * @desc    Cập nhật voucher
 */
voucherRouter.patch(
  "/:id",
  validate(updateVoucher),
  voucherController.update,
);

/**
 * @route   DELETE /api/v1/internal/vouchers/:id
 * @desc    Xóa voucher
 */
voucherRouter.delete(
  "/:id",
  validate(deleteVoucher),
  voucherController.remove,
);

export default voucherRouter;
