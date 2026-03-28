import { defineEntity } from "./_entity.js";

export const OrderEntity = defineEntity("Order", {
  select: {
    id: true,
    storeId: true,
    customerId: true,
    type: true,
    status: true,
    subtotal: true,
    discount: true,
    tax: true,
    serviceFee: true,
    total: true,
    note: true,
    createdByStaffId: true,
    createdAt: true,
    updatedAt: true,
  },
  include: {
    store: true,
    customer: true,
    items: { include: { options: true, product: true } },
    payments: { include: { refunds: true } },
    delivery: { include: { events: true } },
    vouchers: true,
    pointTransactions: true,
  },
});

