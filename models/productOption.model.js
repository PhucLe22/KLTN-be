import { defineEntity } from "./_entity.js";

export const ProductOptionEntity = defineEntity("ProductOption", {
  select: {
    id: true,
    groupId: true,
    name: true,
    basePrice: true,
    sortOrder: true,
    isActive: true,
  },
  include: {
    group: true,
    productValues: true,
  },
});

