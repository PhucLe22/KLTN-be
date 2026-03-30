import { z } from "zod";
import { CustomerTier, StaffRole } from "../constants/enum.js";

const baseUserInfo = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string().email().nullable(),
  role: z.nativeEnum(StaffRole).or(z.string()), // StaffRole or other roles like ADMIN/CUSTOMER
});

const customerSchema = z.object({
  name: z.string().nullable(),
  phone: z.string(),
  email: z.string().nullable(),
  tier: z.nativeEnum(CustomerTier),
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
