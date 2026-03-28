import { defineEntity } from "./_entity.js";

export const StoreEntity = defineEntity("Store", {
  select: {
    id: true,
    code: true,
    name: true,
    address: true,
    lat: true,
    lng: true,
    hotline: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  },
  include: {
    staff: true,
    orders: true,
    deliveryOrders: true,
  },
});

