import { z } from "zod";
import { VALIDATION_MESSAGES } from "../../constants/errors.js";
import * as f from "../common.schema.js";

// GET /api/v1/stores
export const getStores = {
  query: z.object({
    search: z.string().optional(),
    limit: z.string().transform(Number).optional().default("10"),
    page: z.string().transform(Number).optional().default("1"),
    lat: z.string().transform(Number).optional(),
    lng: z.string().transform(Number).optional(),
  }),
};

// POST /api/v1/stores
export const createStores = {
  body: z.object({
    code: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED),
    name: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED),
    address: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED),
    hotline: f.hotline,
    lat: f.lat,
    lng: f.lng,
  }),
};

// PUT /api/v1/stores/:id
export const updateStores = {
  params: z.object({
    id: f.id,
  }),
  body: z.object({
    code: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED).optional(),
    name: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED).optional(),
    address: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED).optional(),
    hotline: f.hotline.optional(),
    lat: f.lat,
    lng: f.lng,
    isActive: z.boolean().optional(),
  }),
};

// DELETE /api/v1/stores/:id
export const deleteStores = {
  params: z.object({
    id: f.id,
  }),
};
