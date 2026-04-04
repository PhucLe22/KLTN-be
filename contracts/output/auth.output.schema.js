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
