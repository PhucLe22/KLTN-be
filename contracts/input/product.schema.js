import { z } from "zod";

// GET /api/v1/products
export const getProductsSchema = {
  query: z.object({
    categoryId: z.string().uuid().optional(),
    search: z.string().optional(),
    limit: z.string().transform(Number).optional(),
    page: z.string().transform(Number).optional(),
  }),
};
