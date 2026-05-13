import { z } from "zod";

// GET /api/v1/stores
export const getStoresSchema = {
  query: z.object({
    lat: z.string().transform(Number).optional(),
    lng: z.string().transform(Number).optional(),
  }),
  
  response: z.object({
    id: z.string(),
    name: z.string(),
    address: z.string(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    code: z.string().nullable(),
    hotline: z.string(),
    isActive: z.boolean(),
    isDeleted: z.boolean()
  })
};

// POST /api/v1/stores
export const createStoreSchema = {
  response: z.object({
    id: z.string(),
    code: z.string().nullable(),
    name: z.string(),
    address: z.string(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    hotline: z.string(),
    isActive: z.boolean(),
    isDeleted: z.boolean(),
    createdAt: z.date()
  })
};

// PUT /api/v1/stores/:id
export const updateStoreSchema = {
  response: z.object({
    id: z.string(),
    code: z.string().nullable(),
    name: z.string(),
    address: z.string(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    hotline: z.string(),
    isActive: z.boolean(),
    isDeleted: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
};


export const deleteStoreSchema = {
  response: z.object({
    message: z.string()
  })
};