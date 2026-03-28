import { defineEntity } from "./_entity.js";

export const OrderItemEntity = defineEntity("OrderItem", {
  select: {
    id: true,
    orderId: true,
    productId: true,
    name: true,
    sku: true,
    price: true,
    quantity: true,
    tax: true,
    discount: true,
    note: true,
  },
  include: {
    order: true,
    product: true,
    options: true,
  },
});

