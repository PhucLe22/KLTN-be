import { defineEntity } from "./_entity.js";

export const CategoryEntity = defineEntity("Category", {
  select: {
    id: true,
    name: true,
    slug: true,
    sortOrder: true,
    isActive: true,
  },
  include: {
    products: true,
  },
});

