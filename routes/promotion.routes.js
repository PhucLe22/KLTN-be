import express from "express";
import { voucherController } from "../controllers/voucher.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { getAvailableVouchers } from "../contracts/input/promotions.schema.js";

const promotionRouter = express.Router();

/**
 * @route   GET /api/v1/promotions/available
 * @desc    Danh sách mã giảm giá có thể áp dụng
 * @access  Public
 */
promotionRouter.get(
  "/available",
  validate(getAvailableVouchers),
  voucherController.listAvailable,
);

export default promotionRouter;
