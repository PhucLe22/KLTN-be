import { z } from "zod";
import { StaffRole } from "../../../constants/enum.js";
import { VALIDATION_MESSAGES } from "../../../constants/errors.js";

// POST /api/v1/admin/stores
export const adminCreateStoreSchema = {
  body: z.object({
    code: z.string().min(2).max(10).toUpperCase(), // Ví dụ: HCM01
    name: z.string().min(5),
    address: z.string().min(10),
    lat: z.number().optional(),
    lng: z.number().optional(),
    hotline: z.string().regex(/^[0-9]{10}$/, VALIDATION_MESSAGES.HOTLINE_INVALID),
  }),
};

// POST /api/v1/admin/staffs
export const adminCreateStaffSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().regex(/^[0-9]{10}$/),
    name: z.string().min(2),
    storeId: z.string().uuid(VALIDATION_MESSAGES.STAFF_STORE_REQUIRED),
    role: z.enum(Object.values(StaffRole)),
  }),
};
