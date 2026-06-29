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
