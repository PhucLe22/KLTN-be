import { defineEntity } from "./_entity.js";

export const CustomerEntity = defineEntity("Customer", {
  select: {
    id: true,
    userId: true,
    name: true,
    phone: true,
    email: true,
    tier: true,
    points: true,
    isActive: true,
    createdAt: true,
  },
  include: {
    user: true,
    orders: true,
    pointTransactions: true,
    vouchers: true,
  },
});

