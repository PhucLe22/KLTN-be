import { z } from "zod";
import { CustomerTier, StaffRole } from "../../constants/enum.js";

const baseUserInfo = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.email().nullable(),
  role: z.enum(StaffRole).or(z.string()),
});

const customerSchema = z.object({
  name: z.string().nullable(),
  phone: z.string(),
  email: z.string().nullable(),
  tier: z.enum(CustomerTier),
  points: z.number(),
});

const storeInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
});

const staffSchema = z.object({
  storeInfo: storeInfoSchema,
  userInfo: baseUserInfo,
  managerInfo: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string().nullable(),
      phone: z.string(),
    })
    .nullable(),
});

const managerSchema = z.object({
  storeInfo: storeInfoSchema,
  userInfo: baseUserInfo,
});

const adminSchema = z.object({
  userInfo: baseUserInfo,
});

export const userInfoSchema = z.union([
  customerSchema,
  staffSchema,
  managerSchema,
  adminSchema,
]);

// GET /api/v1/users
export const getUsersSchema = {
  response: z.object({
    id: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    staff: z.object({
      id: z.string(),
      role: z.string(),
      storeId: z.string().nullable()
    }).nullable(),
    customer: z.object({
      id: z.string(),
      name: z.string().nullable()
    }).nullable()
  })
};

// PUT /api/v1/users/:id
export const updateUserSchema = {
  response: z.object({
    id: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    staff: z.object({
      id: z.string(),
      role: z.string(),
      storeId: z.string().nullable()
    }).nullable(),
    customer: z.object({
      id: z.string(),
      name: z.string().nullable()
    }).nullable()
  })
};

// DELETE /api/v1/users/:id
export const deleteUserSchema = {
  response: z.object({
    message: z.string()
  })
};
