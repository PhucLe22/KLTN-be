import { z } from "zod";

export const registerDto = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[0-9]{10,11}$/).optional(),
  password: z.string().min(6),
}).refine((data) => data.email || data.phone);