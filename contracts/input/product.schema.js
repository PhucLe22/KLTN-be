import { z } from "zod";
import * as f from "../common.schema.js";
import { ProductType } from "../../constants/enum.js";

// GET /api/v1/products
export const getProducts = {
  query: z.object({
    search: z.string().optional(),
    limit: z.string().transform(Number).optional().default("10"),
    page: z.string().transform(Number).optional().default("1"),
    sortBy: z.enum(["name", "basePrice", "createdAt", "sortOrder"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    categoryId: f.id.optional(),
    type: z.enum(Object.values(ProductType)).optional(),
    isActive: z.enum(["true", "false"]).optional().default("true"),
  }),
};

// POST /api/v1/products
export const createProduct = {
  body: z.object({
    sku: z.string().min(1, "SKU is required"),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    type: z.enum(Object.values(ProductType)).default("SIMPLE"),
    basePrice: z.number().positive("Base price must be positive"),
    costPrice: z.number().positive("Cost price must be positive").optional(),
    taxRate: z.number().min(0, "Tax rate must be non-negative").max(1, "Tax rate must be <= 1").default(0),
    thumbnail: z.string().url("Invalid thumbnail URL").optional(),
    images: z.array(z.string().url("Invalid image URL")).optional(),
    category: z.object({
      id: f.id,
    }).optional(),
    sortOrder: z.number().int("Sort order must be integer").optional(),
    preparationTime: z.number().int("Preparation time must be integer").min(0, "Preparation time must be non-negative").optional(),
    optionGroups: z.array(z.object({
      optionGroupId: f.id,
      sortOrder: z.number().int("Sort order must be integer").optional(),
      optionValues: z.array(z.object({
        optionId: f.id,
        price: z.number().min(0, "Price must be non-negative")
      })).optional()
    })).optional()
  }),
};

// PUT /api/v1/products/:id
export const updateProduct = {
  params: z.object({
    id: f.id,
  }),
  body: z.object({
    sku: z.string().min(1, "SKU is required").optional(),
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().optional(),
    type: z.enum(Object.values(ProductType)).optional(),
    basePrice: z.number().positive("Base price must be positive").optional(),
    costPrice: z.number().positive("Cost price must be positive").optional(),
    taxRate: z.number().min(0, "Tax rate must be non-negative").max(1, "Tax rate must be <= 1").optional(),
    thumbnail: z.string().url("Invalid thumbnail URL").optional(),
    images: z.array(z.string().url("Invalid image URL")).optional(),
    category: z.object({
      id: f.id,
    }).optional(),
    sortOrder: z.number().int("Sort order must be integer").optional(),
    preparationTime: z.number().int("Preparation time must be integer").min(0, "Preparation time must be non-negative").optional(),
    isActive: z.boolean().optional(),
  }),
};

// DELETE /api/v1/products/:id
export const deleteProduct = {
  params: z.object({
    id: f.id,
  }),
};

// PUT /api/v1/products/:id/option-groups/:optionGroupId
export const updateProductOptionGroup = {
  params: z.object({
    id: f.id,
    optionGroupId: f.id,
  }),
  body: z.object({
    sortOrder: z.number().int("Sort order must be integer").optional(),
    optionValues: z.array(z.object({
      optionId: f.id,
      price: z.number().min(0, "Price must be non-negative")
    })).optional()
  }),
};

// GET /api/v1/products/:slug
export const getProductBySlug = {
  params: z.object({
    slug: z.string().min(1, "Slug is required"),
  }),
};
