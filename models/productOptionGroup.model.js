import { defineEntity } from "./_entity.js";

export const ProductOptionGroupEntity = defineEntity("ProductOptionGroup", {
  select: {
    id: true,
    productId: true,
    optionGroupId: true,
    sortOrder: true,
  },
  include: {
    product: true,
    optionGroup: true,
  },
});

