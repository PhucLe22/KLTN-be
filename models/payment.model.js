import { defineEntity } from "./_entity.js";

export const PaymentEntity = defineEntity("Payment", {
  select: {
    id: true,
    orderId: true,
    method: true,
    status: true,
    amount: true,
    providerRef: true,
    paidAt: true,
    createdAt: true,
  },
  include: {
    order: true,
    refunds: true,
  },
});

