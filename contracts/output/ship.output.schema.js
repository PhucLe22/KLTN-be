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
