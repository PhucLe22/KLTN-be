import { defineEntity } from "./_entity.js";

export const CustomerVoucherEntity = defineEntity("CustomerVoucher", {
  select: {
    id: true,
    customerId: true,
    voucherId: true,
    isUsed: true,
  },
  include: {
    customer: true,
    voucher: true,
  },
});

