import express from "express";
import { voucherController } from "../controllers/voucher.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  getAvailableVouchers,
  listPublicVouchers,
  validateVoucherInput,
} from "../contracts/input/promotions.schema.js";

const promotionRouter = express.Router();

/**
 * @route   GET /api/v1/promotions
 * @desc    Danh sách voucher khả dụng cho khách hàng (có phân trang)
 * @access  Public
 */
promotionRouter.get(
  "/",
  validate(listPublicVouchers),
  voucherController.listPublic,
);

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

/**
 * @route   POST /api/v1/promotions/validate
 * @desc    Kiểm tra mã giảm giá và trả về số tiền giảm
 * @access  Public
 */
promotionRouter.post(
  "/validate",
  validate(validateVoucherInput),
  voucherController.validate,
);

export default promotionRouter;
