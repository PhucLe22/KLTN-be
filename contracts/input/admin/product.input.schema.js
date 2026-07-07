import { z } from "zod";
import * as f from "../../common.schema.js";
import { ProductType } from "../../../constants/enum.js";

export const getAdminProducts = {
  query: z.object({
    search: z.string().optional(),
    limit: z.string().transform(Number).optional().default("10"),
    page: z.string().transform(Number).optional().default("1"),
    sortBy: z.enum(["name", "basePrice", "createdAt", "sortOrder"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    categoryId: f.id.optional(),
    type: z.enum(Object.values(ProductType)).optional(),
    isActive: z.enum(["true", "false"]).optional(),
  }),
};

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
