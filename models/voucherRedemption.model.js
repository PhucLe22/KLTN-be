import { defineEntity } from "./_entity.js";

export const VoucherRedemptionEntity = defineEntity("VoucherRedemption", {
  select: {
    id: true,
    orderId: true,
    voucherId: true,
    discount: true,
  },
  include: {
    order: true,
    voucher: true,
  },
});

