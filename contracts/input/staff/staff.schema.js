import { z } from "zod";
import * as f from "../../common.schema.js";

export const updateStaff = {
  params: z.object({
    id: f.id,
  }),
  body: z.object({
    name: z.string().min(2).max(40).optional(),
    email: f.email.optional(),
    phone: f.phone.optional(),
    password: f.password.optional(),
    role: f.role.optional(),
    storeId: f.id.optional(),
    isActive: z.boolean().optional(),
  }),
};

export const getStaffs = {
  query: z.object({
    page: z.string().transform(Number).optional().default("1"),
    limit: z.string().transform(Number).optional().default("10"),
    role: f.role.optional(),
    search: z.string().optional(),
    storeId: f.id.optional(),
    sortBy: z.enum(["createdAt", "role"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
};

export const deleteStaff = {
  params: z.object({
    id: f.id,
  }),
};
