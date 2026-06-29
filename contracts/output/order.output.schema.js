export const OrderMap = {
  id: true,
  orderCode: true,
  status: true,
  type: true,
  subtotal: true,
  discount: true,
  tax: true,
  serviceFee: true,
  total: true,
  note: (s) => {
    if (s.status === 'COMPLETED') {
      return s.delivery?.deliveredAt ?? null;
    }
    return s.note ?? null;
  },
  tableNumber: true,
  createdAt: true,
  updatedAt: true,
  expectedReadyAt: true,
  totalItems: (s) => (s.items || []).reduce((sum, item) => sum + item.quantity, 0),
  assignedChef: {
    id: true,
    user: {
      name: true,
      email: true,
    },
  },
  delivery: {
    id: true,
    status: true,
    addressLine: true,
    lat: true,
    lng: true,
    shipperId: true,
    deliverySequence: true,
    deliveredAt: true,
    assignedShipper: {
      id: true,
      user: {
        name: true,
        email: true,
      },
    },
  },
  store: {

    id: true,
    name: true,
    address: true,
  },
  customer: {
    id: true,
    name: true,
    phone: true,
    tier: true,
    address: (s) => {
      const addr = s.addresses?.[0];
      return addr ? {
        addressLine: addr.addressLine,
        lat: addr.lat,
        lng: addr.lng,
        label: addr.label,
      } : null;
    },
  },
  address: (s) => s.delivery?.addressLine ?? null,
  createdBy: (s) => s.createdBy ? {
    id: s.createdBy.id,
    name: s.createdBy.name
  } : null,
  orderItems: (s) => (s.items || []).map(item => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    price: Number(item.price),
    quantity: item.quantity,
    discount: item.discount,
    tax: item.tax,
    note: item.note,
    thumbnail: item.product?.thumbnail ?? null,
    options: (item.options || []).map(opt => opt.name),
  })),
  estimatedArrival: (s) => s.expectedReadyAt ? new Date(s.expectedReadyAt).toISOString() : null,
  driver: (s) => {
    const shipper = s.delivery?.assignedShipper;
    if (!shipper) return null;
    return { name: shipper.user?.name ?? 'Shipper' };
  },
};

export const StaffOrderSummaryMap = {
  orderCode: true,
  status: true,
  total: true,
  items: [{
    quantity: true,
    product: {
      name: true,
      thumbnail: true,
      sku: true,
    }
  }]
};

export const OrderActivityMap = {
  status: true,
  label: true,
  time: true,
  isPast: true,
  isEstimate: true,
  description: true,
};
