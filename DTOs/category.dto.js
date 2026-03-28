import { z } from 'zod';

// Create Category DTO
export const createCategoryDto = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true)
});

// Update Category DTO
export const updateCategoryDto = createCategoryDto.partial();

// Category Response DTO
export const categoryResponseDto = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime()
});

// Category Query DTO
export const categoryQueryDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional()
});
