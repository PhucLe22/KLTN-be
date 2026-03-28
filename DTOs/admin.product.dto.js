import { z } from 'zod';

// Create Admin Product DTO
export const createAdminProductDto = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  sku: z.string().min(1).max(100),
  price: z.number().min(0),
  categoryId: z.string().uuid(),
  inStock: z.boolean().default(true),
  isActive: z.boolean().default(true),
  thumbnail: z.string().optional()
});

// Update Admin Product DTO
export const updateAdminProductDto = createAdminProductDto.partial();

// Admin Product Response DTO
export const adminProductResponseDto = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  sku: z.string(),
  price: z.number(),
  categoryId: z.string().uuid(),
  category: z.object({
    id: z.string().uuid(),
    name: z.string()
  }).optional(),
  inStock: z.boolean(),
  isActive: z.boolean(),
  thumbnail: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Admin Product Query DTO
export const adminProductQueryDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  inStock: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional()
});
