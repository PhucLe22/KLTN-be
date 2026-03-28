import { defineEntity } from "./_entity.js";

export const ProductOptionValueEntity = defineEntity("ProductOptionValue", {
  select: {
    id: true,
    productId: true,
    optionId: true,
    price: true,
  },
  include: {
    product: true,
    option: true,
  },
});

