import { z } from "zod";

// GET /api/v1/products
export const getProductsSchema = {
  query: z.object({
    categoryId: z.string().uuid().optional(),
    search: z.string().optional(),
    limit: z.string().transform(Number).optional().default("10"),
    page: z.string().transform(Number).optional().default("1"),
  }),

  response: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.any().transform(v => Number(v)), // basePrice -> price
    thumbnail: z.string().nullable(),
    preparationTime: z.number().nullable(),
  })
};

// GET /api/v1/products/:slug
export const getProductBySlugSchema = {
  response: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.any().transform(v => Number(v)), // basePrice -> price
    thumbnail: z.string().nullable(),
    preparationTime: z.number().nullable(),
  })
};
