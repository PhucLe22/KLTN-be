import { z } from "zod";
import { CustomerTier, StaffRole } from "../../constants/enum.js";
import { USER_FILTERS } from "../../constants/userFilters.js";

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
  query: z.object({
    search: z.string().optional(),
    limit: z.string().transform(Number).optional().default("10"),
    page: z.string().transform(Number).optional().default("1"),
    sortBy: z.enum(Object.values(USER_FILTERS.SORT_BY)).optional().default(USER_FILTERS.SORT_BY.CREATED_AT),
    sortOrder: z.enum(Object.values(USER_FILTERS.SORT_ORDER)).optional().default(USER_FILTERS.SORT_ORDER.DESC),
    isActive: z.enum(Object.values(USER_FILTERS.BOOLEAN)).optional(),
    role: z.enum(Object.values(USER_FILTERS.ROLES)).optional(),
    staff: z.enum(Object.values(USER_FILTERS.BOOLEAN)).optional(),
  }),
};

// PUT /api/v1/users/:id
export const updateUserSchema = {
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
  body: z.object({
    isActive: z.boolean().optional(),
    role: z.enum(Object.values(USER_FILTERS.ROLES)).optional(),
    store_id: z.string().uuid("Invalid store ID format").optional(),
  }),
};

// DELETE /api/v1/users/:id
export const deleteUserSchema = {
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
};
