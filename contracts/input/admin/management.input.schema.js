import { z } from "zod";
import { StaffRole } from "../../../constants/enum.js";
import { VALIDATION_MESSAGES } from "../../../constants/errors.js";
import { name, email, password, phone, role, address, lat, lng, hotline, id } from "../../../contracts/common.schema.js";

// POST /api/v1/admin/stores
export const adminCreateStore = {
  body: z.object({
    code: z.string().min(2).max(10).toUpperCase(), // Ví dụ: HCM01
    name: name.min(5), // Override min for store name
    address,
    lat,
    lng,
    hotline,
  }),
};

// POST /api/v1/admin/staffs
export const adminCreateStaff = {
  body: z.object({
    email,
    password,
    phone,
    name,
    storeId: id,
    role,
  }),
};
