import { z } from "zod";
import * as f from "../common.schema.js";

export const registerOutputSchema = z.object({
  id: f.id,
  email: f.email,
  phone: f.phone,
});

export const loginOutputSchema = z.object({
  id: f.id,
  name: f.name,
  email: f.email,
  type: f.userType,

  // Thông tin riêng cho Customer (Optional)
  tier: f.tier.optional(),
  points: f.points.optional(),

  // Thông tin riêng cho Staff (Optional)
  role: f.role.optional(),
  storeName: z.string().optional(),

  // Thông tin Tokens
  accessToken: f.token,
  refreshToken: f.token,
});

// Trả về cho Guest (Quick Customer) tại quầy
export const guestOutputSchema = z.object({
  customerId: f.id,
  name: f.name,
  phone: f.phone,
  tier: f.tier,
});

// Profile response (cho GET /profile)
export const customerProfileSchema = z.object({
  name: f.name,
  phone: z.union([z.string().regex(/^[0-9]{10,11}$/), z.null()]).optional(),
  email: z.union([z.string().email(), z.null()]).optional(),
  tier: f.tier,
  points: f.points,
});

export const staffProfileSchema = z.object({
  storeInfo: z.object({
    id: f.id,
    name: z.string(),
    address: z.string(),
  }),
  userInfo: z.object({
    email: z.union([z.string().email(), z.null()]).optional(),
    phone: z.union([z.string().regex(/^[0-9]{10,11}$/), z.null()]).optional(),
    name: f.name,
    role: f.role,
  }),
  managerInfo: z
    .object({
      id: f.id,
      name: f.name,
      email: z.union([z.string().email(), z.null()]).optional(),
      phone: z.union([z.string().regex(/^[0-9]{10,11}$/), z.null()]).optional(),
    })
    .optional()
    .nullable(),
});

export const managerProfileSchema = z.object({
  storeInfo: z.object({
    id: f.id,
    name: z.string(),
    address: z.string(),
  }),
  userInfo: z.object({
    email: z.union([z.string().email(), z.null()]).optional(),
    phone: z.union([z.string().regex(/^[0-9]{10,11}$/), z.null()]).optional(),
    name: f.name,
    role: f.role,
  }),
});

export const adminProfileSchema = z.object({
  userInfo: z.object({
    email: z.union([z.string().email(), z.null()]).optional(),
    phone: z.union([z.string().regex(/^[0-9]{10,11}$/), z.null()]).optional(),
    name: f.name,
    role: z.enum(["OWNER", "ADMIN", "ROOT"]),
  }),
});

export const profileOutputSchema = z.union([
  customerProfileSchema,
  staffProfileSchema,
  managerProfileSchema,
  adminProfileSchema,
]);

