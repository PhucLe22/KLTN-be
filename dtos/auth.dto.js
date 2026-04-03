import { z } from "zod";

// Trả về cho Customer & Staff sau khi tạo tài khoản thành công
export const AccountOutputSchema = z.object({
  id: z.string(),
  email: z.email().nullable().optional(),
  phone: z.string(),
});
export const LoginOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  type: z.enum(["STAFF", "CUSTOMER"]),

  // Thông tin riêng cho Customer (Optional)
  tier: z.string().optional(),
  points: z.number().optional(),

  // Thông tin riêng cho Staff (Optional)
  role: z.string().optional(),
  storeName: z.string().optional(),

  // Thông tin Tokens
  accessToken: z.string(),
  refreshToken: z.string(),
});

// Trả về cho Guest (Quick Customer) tại quầy
export const GuestOutputSchema = z.object({
  customerId: z.string(),
  name: z.string(),
  phone: z.string(),
  tier: z.string().default("BRONZE"),
});
