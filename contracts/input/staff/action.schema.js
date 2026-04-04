import { z } from "zod";

// Cập nhật tồn kho nhanh (Bật/Tắt sản phẩm tại chi nhánh)
export const updateProductStockSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
};

// Cập nhật vị trí Shipper
export const updateDeliveryLocationSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
};
