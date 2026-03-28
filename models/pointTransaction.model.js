import { defineEntity } from "./_entity.js";

export const PointTransactionEntity = defineEntity("PointTransaction", {
  select: {
    id: true,
    customerId: true,
    orderId: true,
    type: true,
    points: true,
    balanceSnap: true,
    createdAt: true,
  },
  include: {
    customer: true,
    order: true,
  },
});

