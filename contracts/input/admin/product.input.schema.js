import { z } from "zod";
import * as f from "../../common.schema.js";

export const adminCreateProduct = {
  body: z.object({
    sku: z.string().min(3).toUpperCase(),
    name: z.string().min(2),
    description: z.string().optional(),
    basePrice: z.number().positive(),
    taxRate: z.number().min(0).max(100).default(8),
    categoryId: f.id,
    thumbnail: z.string().url().optional(),
    // Danh sách các Option Group cho phép (Size, Topping...)
    optionGroupIds: z.array(f.id).optional(),
  }),
};
