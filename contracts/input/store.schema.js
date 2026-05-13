import { z } from "zod";
import { VALIDATION_MESSAGES } from "../../constants/errors.js";

// GET /api/v1/stores
export const getStoresSchema = {
  query: z.object({
    search: z.string().optional(),
    limit: z.string().transform(Number).optional().default("10"),
    page: z.string().transform(Number).optional().default("1"),
    lat: z.string().transform(Number).optional(),
    lng: z.string().transform(Number).optional(),
  }),
};

// POST /api/v1/stores
export const createStoresSchema = {
  body: z.object({
    code: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED),
    name: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED),
    address: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED),
    hotline: z.string().regex(/^\d{10}$/, VALIDATION_MESSAGES.HOTLINE_INVALID),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
};

// PUT /api/v1/stores/:id
export const updateStoresSchema = {
  params: z.object({
    id: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
  }),
  body: z.object({
    code: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED).optional(),
    name: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED).optional(),
    address: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED).optional(),
    hotline: z.string().regex(/^\d{10}$/, VALIDATION_MESSAGES.HOTLINE_INVALID).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
};

// DELETE /api/v1/stores/:id
export const deleteStoresSchema = {
  params: z.object({
    id: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
  }),
};
