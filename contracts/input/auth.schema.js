import { z } from "zod";
import * as f from "../common.schema.js";
export const registerCustomer = {
  body: z.object({
    name: f.name,
    phone: f.phone,
    email: f.email.optional().nullable(),
    password: f.password,
  }),
};

export const registerStaff = {
  body: z.object({
    email: f.email,
    phone: f.phone,
    password: f.password,
    storeId: f.id,
    role: f.role,
  }),
};

export const registerGuest = {
  body: z.object({
    phone: f.phone,
    name: f.name,
  }),
};

export const forgotPassword = {
  body: z.object({
    email: f.email,
  }),
};

export const resetPassword = {
  body: z.object({
    token: z.string().min(1, "Token không được để trống"),
    password: f.password,
  }),
};
