import { z } from "zod";
import { DiscountType, VoucherScope } from "../../constants/enum.js";
import * as f from "../common.schema.js";

// GET /api/v1/promotions/available
export const getAvailableVouchers = {
  query: z.object({
    storeId: f.id.optional(),
    orderAmount: z.string().transform(Number).optional(),
  }),
};

// Internal API schemas
export const createVoucher = {
  body: z.object({
    code: z.string().min(3).max(20),
    scope: z.nativeEnum(VoucherScope).default(VoucherScope.PUBLIC),
    discountType: z.nativeEnum(DiscountType),
    discountValue: z.number().positive(),
    maxUsage: z.number().int().positive().nullable().optional(),
    minOrderAmount: z.number().nonnegative().nullable().optional(),
    maxDiscount: z.number().positive().nullable().optional(),
    storeId: f.id.nullable().optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    isActive: z.boolean().default(true),
  }),
};

export const updateVoucher = {
  params: z.object({
    id: f.id,
  }),
  body: createVoucher.body.partial(),
};

export const deleteVoucher = {
  params: z.object({
    id: f.id,
  }),
};

