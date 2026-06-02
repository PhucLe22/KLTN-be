import { BaseController } from "./base.controller.js";
import { voucherService } from "../services/voucher.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { VoucherMapper } from "../mappers/voucher.mapper.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";

class VoucherController extends BaseController {
  constructor() {
    super(voucherService);
  }

  getAvailableVouchers = asyncHandler(async (req, res) => {
    const result = await this.service.getAvailableVouchers(req.query);
    const formatted = VoucherMapper.toAvailableVouchersResponse(result);

    return this.success(res, {
      data: formatted,
    });
  });

  createVoucher = asyncHandler(async (req, res) => {
    const result = await this.service.createVoucher(req.body);
    const formatted = VoucherMapper.toVoucherResponse(result);

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.CREATED,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.CREATED],
      data: formatted,
    });
  });

  updateVoucher = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.service.updateVoucher(id, req.body);
    const formatted = VoucherMapper.toVoucherResponse(result);

    return this.success(res, {
      data: formatted,
    });
  });

  deleteVoucher = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await this.service.deleteVoucher(id);

    return this.success(res, {
      message: SUCCESS_MESSAGES.DELETE_SUCCESS || "Deleted successfully",
    });
  });
}

export const voucherController = new VoucherController();
