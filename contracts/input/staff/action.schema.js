import { z } from "zod";
import * as f from "../common.schema.js";

// Cập nhật tồn kho nhanh (Bật/Tắt sản phẩm tại chi nhánh)
export const updateProductStock = {
  params: z.object({
    id: f.id,
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
};

// Cập nhật vị trí Shipper
export const updateDeliveryLocation = {
  params: z.object({
    id: f.id,
  }),
  body: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
};
