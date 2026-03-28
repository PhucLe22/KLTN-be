import { defineEntity } from "./_entity.js";

export const OptionGroupEntity = defineEntity("OptionGroup", {
  select: {
    id: true,
    name: true,
    isRequired: true,
    isMultiple: true,
    sortOrder: true,
    isActive: true,
  },
  include: {
    options: true,
    products: true,
  },
});

