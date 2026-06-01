import { z } from "zod";
import { DiscountType, VoucherScope } from "../../constants/enum.js";

// GET /api/v1/promotions/available
export const getAvailableVouchersSchema = {
  query: z.object({
    storeId: z.string().uuid().optional(),
    orderAmount: z.string().transform(Number).optional(),
  }),
};

// Internal API schemas
export const createVoucherSchema = {
  body: z.object({
    code: z.string().min(3).max(20),
    scope: z.nativeEnum(VoucherScope).default(VoucherScope.PUBLIC),
    discountType: z.nativeEnum(DiscountType),
    discountValue: z.number().positive(),
    maxUsage: z.number().int().positive().nullable().optional(),
    minOrderAmount: z.number().nonnegative().nullable().optional(),
    maxDiscount: z.number().positive().nullable().optional(),
    storeId: z.string().uuid().nullable().optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    isActive: z.boolean().default(true),
  }),
};

export const updateVoucherSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: createVoucherSchema.body.partial(),
};

export const deleteVoucherSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

