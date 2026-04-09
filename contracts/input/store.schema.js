import { z } from "zod";

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
