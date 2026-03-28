import { defineEntity } from "./_entity.js";

export const StaffEntity = defineEntity("Staff", {
  select: {
    id: true,
    userId: true,
    storeId: true,
    role: true,
    isActive: true,
    createdAt: true,
  },
  include: {
    user: true,
    store: true,
  },
});

