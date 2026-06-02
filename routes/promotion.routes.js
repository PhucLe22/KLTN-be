import express from "express";
import { voucherController } from "../controllers/voucher.controller.js";
import { validateData } from "../middlewares/validate.middleware.js";
import { getAvailableVouchersSchema } from "../contracts/input/promotions.schema.js";

const promotionRouter = express.Router();

/**
 * @route   GET /api/v1/promotions/available
 * @desc    Danh sách mã giảm giá có thể áp dụng
 * @access  Public
 */
promotionRouter.get(
  "/available",
  validateData(getAvailableVouchersSchema),
  voucherController.getAvailableVouchers,
);

export default promotionRouter;
