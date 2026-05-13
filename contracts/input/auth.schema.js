import { z } from "zod";
import * as f from "../common.schema.js";
export const registerCustomerSchema = {
  body: z.object({
    name: f.name,
    phone: f.phone,
    email: f.email.optional().nullable(),
    password: f.password,
  }),
};

export const registerStaffSchema = {
  body: z.object({
    email: f.email,
    phone: f.phone,
    password: f.password,
    storeId: f.id,
    role: f.role,
  }),
};

export const registerGuestSchema = {
  body: z.object({
    phone: f.phone,
    name: f.name,
  }),
};
