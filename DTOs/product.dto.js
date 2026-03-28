import { z } from 'zod';

// Product Query DTO for filtering and searching
export const productQueryDto = z.object({
  category: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
});

// Product Response DTO for public listing
export const productResponseDto = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  thumbnail: z.string().optional()
});