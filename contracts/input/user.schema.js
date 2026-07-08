import { z } from "zod";
import { CustomerTier, StaffRole } from "../../constants/enum.js";
import { USER_FILTERS } from "../../constants/userFilters.js";
import * as f from "../common.schema.js";

const baseUserInfo = z.object({
  name: z.string(),
  phone: f.phone,
  email: f.email.optional().nullable(),
  role: z.enum(StaffRole).or(z.string()),
});

const customerSchema = z.object({
  name: z.string().nullable(),
  phone: f.phone,
  email: f.email.optional().nullable(),
  tier: f.tier,
  points: f.points,
});

const storeInfoSchema = z.object({
  id: f.id,
  name: f.name,
  address: f.address,
});

const staffSchema = z.object({
  storeInfo: storeInfoSchema,
  userInfo: baseUserInfo,
  managerInfo: z
    .object({
      id: f.id,
      name: f.name,
      email: f.email.optional().nullable(),
      phone: f.phone,
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

export const userInfo = z.union([
  customerSchema,
  staffSchema,
  managerSchema,
  adminSchema,
]);

// GET /api/v1/users
export const getUsers = {
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
export const updateUser = {
  params: z.object({
    id: f.id,
  }),
  body: z.object({
    isActive: z.boolean().optional(),
    role: z.enum(Object.values(USER_FILTERS.ROLES)).optional(),
    store_id: f.id.optional(),
  }),
};

// DELETE /api/v1/users/:id
export const deleteUser = {
  params: z.object({
    id: f.id,
  }),
};
