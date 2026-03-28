import { defineEntity } from "./_entity.js";

export const UserEntity = defineEntity("User", {
  select: {
    id: true,
    email: true,
    phone: true,
    password: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  },
  include: {
    staff: true,
    customer: true,
  },
});

