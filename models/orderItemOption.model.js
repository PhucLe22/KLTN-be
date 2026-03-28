import { defineEntity } from "./_entity.js";

export const OrderItemOptionEntity = defineEntity("OrderItemOption", {
  select: {
    id: true,
    orderItemId: true,
    name: true,
    price: true,
  },
  include: {
    orderItem: true,
  },
});

