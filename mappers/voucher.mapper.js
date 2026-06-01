export class VoucherMapper {
  static toVoucherResponse(voucher) {
    return {
      id: voucher.id,
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      maxUsage: voucher.maxUsage,
      usedCount: voucher.usedCount,
      minOrderAmount: voucher.minOrderAmount,
      maxDiscount: voucher.maxDiscount,
      store: voucher.store ? {
        id: voucher.store.id,
        name: voucher.store.name,
      } : null,
      expiresAt: voucher.expiresAt,
      isActive: voucher.isActive,
    };
  }

  static toAvailableVouchersResponse(vouchers) {
    return vouchers.map(this.toVoucherResponse);
  }
}
