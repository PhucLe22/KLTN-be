export const ShipMap = {
  id: true,
  orderId: true,
  status: true,
  driverId: true,
  estimatedTime: true,
  actualTime: true,
  distance: true,
  cost: true,
  createdAt: true,
  updatedAt: true,
};

export const RouteOptimizationMap = {
  routes: [{
    staffId: true,
    orders: [{
      orderId: true,
      sequence: true,
      estimatedArrival: true,
    }],
    totalDistance: true,
    totalDuration: true,
  }],
  unassignedOrders: [true],
};

export const InternalDeliveryQueueMap = {
  id: 'order.orderCode',
  customer: (s) => s.order.customer?.name || "Khách hàng",
  status: (s) => {
    const statusMap = {
      NEW: "MỚI",
      CONFIRMED: "ĐÃ XÁC NHẬN",
      PREPARING: "ĐANG CHUẨN BỊ",
      READY: "SẴN SÀNG",
      DELIVERING: "ĐANG GIAO",
    };
    return statusMap[s.order.status] || s.order.status;
  },
  address: 'addressLine',
  items: (s) => s.order.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
  location: (s) => ({ lng: s.lng, lat: s.lat }),
  isFocused: (s, ctx) => ctx.firstId === s.id,
};

