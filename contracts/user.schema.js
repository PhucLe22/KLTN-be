import { z } from "zod";

const baseUserInfo = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string().email().nullable(),
  role: z.string(),
});

const customerSchema = z.object({
  name: z.string().nullable(),
  phone: z.string(),
  email: z.string().nullable(),
  tier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]),
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
