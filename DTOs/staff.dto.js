import { z } from 'zod';

// Staff Role Enum
export const StaffRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  SHIPPER: 'SHIPPER'
};

// Create Staff DTO
export const createStaffDto = z.object({
  userId: z.string().uuid(),
  storeId: z.string().uuid(),
  role: z.nativeEnum(StaffRole),
  isActive: z.boolean().default(true)
});

// Update Staff DTO
export const updateStaffDto = createStaffDto.partial();

// Staff Response DTO
export const staffResponseDto = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  storeId: z.string().uuid(),
  role: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  user: z.object({
    email: z.string(),
    phone: z.string().optional()
  }).optional(),
  store: z.object({
    name: z.string(),
    address: z.string()
  }).optional()
});

// Staff Query DTO
export const staffQueryDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  storeId: z.string().uuid().optional(),
  role: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional()
});
