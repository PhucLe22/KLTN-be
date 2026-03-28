import { defineEntity } from "./_entity.js";

export const ProductEntity = defineEntity("Product", {
  select: {
    id: true,
    sku: true,
    name: true,
    description: true,
    type: true,
    basePrice: true,
    costPrice: true,
    taxRate: true,
    thumbnail: true,
    images: true,
    isActive: true,
    sortOrder: true,
    categoryId: true,
    createdAt: true,
    updatedAt: true,
  },
  include: {
    category: true,
    optionGroups: true,
    optionValues: true,
  },
});

