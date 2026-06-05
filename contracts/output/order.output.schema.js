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
  note: true,
  tableNumber: true,
  createdAt: true,
  updatedAt: true,
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
  },
  createdBy: (s) => s.createdByInfo ? {
    id: s.createdByInfo.id,
    name: s.createdByInfo.name
  } : null,
  orderItems: [{
    name: true,
    price: true,
    quantity: true,
    discount: true,
    tax: true,
    note: true,
    options: [{
      name: true,
      price: true,
    }]
  }],
};
