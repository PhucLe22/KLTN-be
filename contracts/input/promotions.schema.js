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

// POST /api/v1/promotions/validate
export const validateVoucherInput = {
  body: z.object({
    code: z.string().min(1),
    orderAmount: z.number().nonnegative(),
    storeId: f.id.optional(),
    customerId: f.id.optional(),
  }),
};

// GET /api/v1/promotions (public)
export const listPublicVouchers = {
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    storeId: f.id.optional(),
    discountType: z.nativeEnum(DiscountType).optional(),
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

export const listVouchers = {
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    storeId: f.id.optional(),
    isActive: z.coerce.boolean().optional(),
    discountType: z.nativeEnum(DiscountType).optional(),
    search: z.string().max(20).optional(),
  }),
};

export const deleteVoucher = {
  params: z.object({
    id: f.id,
  }),
};

