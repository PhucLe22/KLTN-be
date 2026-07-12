import { voucherService } from "../services/voucher.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { mapper } from "../lib/mapper.js";
import { VoucherMap } from "../contracts/output/promotions.output.schema.js";

class VoucherController {
  listAvailable = asyncHandler(async (req, res) => {
    const vouchers = await voucherService.getAvailableVouchers(req.query);
    const result = mapper(vouchers.items, VoucherMap);

    return res.ok(result, vouchers.meta);
  });

  suggest = asyncHandler(async (req, res) => {
    const vouchers = await voucherService.suggestVouchers(req.query);

    return res.ok(vouchers);
  });

  validate = asyncHandler(async (req, res) => {
    const { code, orderAmount, storeId, customerId } = req.body;
    const voucher = await voucherService.validateVoucher(code, orderAmount, storeId, customerId);

    // Calculate discount amount
    let discountAmount;
    if (voucher.discountType === 'PERCENT') {
      discountAmount = (Number(orderAmount) * Number(voucher.discountValue)) / 100;
      if (voucher.maxDiscount !== null) {
        discountAmount = Math.min(discountAmount, Number(voucher.maxDiscount));
      }
    } else {
      discountAmount = Number(voucher.discountValue);
    }
    discountAmount = Math.min(discountAmount, Number(orderAmount));

    // Return essential info for frontend display
    return res.ok({
      id: voucher.id,
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      discountAmount,
      maxDiscount: voucher.maxDiscount,
      minOrderAmount: voucher.minOrderAmount,
    });
  });

  listPublic = asyncHandler(async (req, res) => {
    const result = await voucherService.getAllPublic(req.query);

    return res.ok(result.items, result.meta);
  });

  list = asyncHandler(async (req, res) => {
    const result = await voucherService.getAll(req.query);

    return res.ok(result.items, result.meta);
  });

  create = asyncHandler(async (req, res) => {
    const voucher = await voucherService.createVoucher(req.body);
    const result = mapper(voucher, VoucherMap);

    return res.ok(result);
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const voucher = await voucherService.updateVoucher(id, req.body);
    const result = mapper(voucher, VoucherMap);

    return res.ok(result);
  });

  remove = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await voucherService.deleteVoucher(id);

    return res.ok();
  });
}

export const voucherController = new VoucherController();
