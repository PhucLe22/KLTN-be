import { defineEntity } from "./_entity.js";

export const DeliveryEventEntity = defineEntity("DeliveryEvent", {
  select: {
    id: true,
    deliveryId: true,
    status: true,
    note: true,
    createdAt: true,
  },
  include: {
    delivery: true,
  },
});

