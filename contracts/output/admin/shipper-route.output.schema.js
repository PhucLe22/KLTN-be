export const RouteStepMap = {
  node: true,
  type: true,
  status: true,
  orderId: true,
  orderCode: true,
  customerName: true,
  customerPhone: true,
  address: true,
  lat: true,
  lng: true,
  storeId: true,
  storeName: true,
  storeAddress: true,
  arrival_datetime: true,
  items: true,
  total: true,
  travel_time_minutes: true,
  load_after_action: true,
  action_amount: true,
};

export const ShipperRouteMap = {
  shipperId: true,
  shipperName: true,
  isPersisted: true,
  routes: [RouteStepMap],
};

export const AdminShipperRoutesMap = {
  numShippers: true,
  numOrders: true,
  shippers: [ShipperRouteMap],
};
