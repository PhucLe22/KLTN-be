import { defineEntity } from "./_entity.js";

export const DeliveryOrderEntity = defineEntity("DeliveryOrder", {
  select: {
    id: true,
    orderId: true,
    storeId: true,
    status: true,
    receiverName: true,
    receiverPhone: true,
    addressLine: true,
    distanceKm: true,
    estimatedFee: true,
    actualFee: true,
    shipperName: true,
    shipperPhone: true,
    trackingCode: true,
    requestedAt: true,
    pickedAt: true,
    deliveredAt: true,
  },
  include: {
    order: true,
    store: true,
    events: true,
  },
});

