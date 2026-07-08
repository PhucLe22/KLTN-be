export const AddressMap = {
  id: true,
  receiverName: true,
  receiverPhone: true,
  addressLine: true,
  lat: true,
  lng: true,
  isDefault: true,
  label: true,
  customerId: (s) => s.customerId || undefined,
  storeId: (s) => s.storeId || undefined,
  createdAt: true,
  updatedAt: true,
};
