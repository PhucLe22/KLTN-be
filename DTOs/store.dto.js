import { z } from 'zod';

// Store Query DTO for finding nearest stores
export const storeQueryDto = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  radiusKm: z.number().min(0).max(100).default(10),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10)
});

// Store Response DTO for public listing
export const storeResponseDto = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  hotline: z.string(),
  isActive: z.boolean()
});

// Admin: Create Store DTO
export const createStoreDto = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  address: z.string().min(1).max(500),
  lat: z.number(),
  lng: z.number(),
  hotline: z.string().min(1).max(20),
  isActive: z.boolean().default(true)
});

// Admin: Update Store DTO
export const updateStoreDto = createStoreDto.partial();

// Admin: Store Query DTO
export const storeQueryAdminDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional()
});
