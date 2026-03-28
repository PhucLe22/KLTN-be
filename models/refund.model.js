import { defineEntity } from "./_entity.js";

export const RefundEntity = defineEntity("Refund", {
  select: {
    id: true,
    paymentId: true,
    amount: true,
    reason: true,
    createdAt: true,
  },
  include: {
    payment: true,
  },
});

