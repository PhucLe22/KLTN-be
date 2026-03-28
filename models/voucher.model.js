import { defineEntity } from "./_entity.js";

export const VoucherEntity = defineEntity("Voucher", {
  select: {
    id: true,
    code: true,
    scope: true,
    discountType: true,
    discountValue: true,
    maxUsage: true,
    usedCount: true,
    minOrderAmount: true,
    maxDiscount: true,
    storeId: true,
    expiresAt: true,
    isActive: true,
  },
  include: {
    redemptions: true,
    customerVouchers: true,
  },
});

