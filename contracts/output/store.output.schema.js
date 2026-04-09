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
    hotline: z.string(),
    isActive: z.boolean()
  })
};
