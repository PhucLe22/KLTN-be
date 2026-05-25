import { z } from "zod";
import { ProductType } from "../../constants/enum.js";

// GET /api/v1/products
export const getProductsSchema = {
  query: z.object({
    search: z.string().optional(),
    limit: z.string().transform(Number).optional().default("10"),
    page: z.string().transform(Number).optional().default("1"),
    sortBy: z.enum(["name", "basePrice", "createdAt", "sortOrder"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    categoryId: z.string().uuid("Invalid category ID format").optional(),
    type: z.enum(Object.values(ProductType)).optional(),
    isActive: z.enum(["true", "false"]).optional().default("true"),
  }),
};

// POST /api/v1/products
export const createProductSchema = {
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
      id: z.string().uuid("Invalid category ID format"),
    }).optional(),
    sortOrder: z.number().int("Sort order must be integer").optional(),
    preparationTime: z.number().int("Preparation time must be integer").min(0, "Preparation time must be non-negative").optional(),
    optionGroups: z.array(z.object({
      optionGroupId: z.string().uuid("Invalid optionGroupId format"),
      sortOrder: z.number().int("Sort order must be integer").optional(),
      optionValues: z.array(z.object({
        optionId: z.string().uuid("Invalid optionId format"),
        price: z.number().min(0, "Price must be non-negative")
      })).optional()
    })).optional()
  }),
};

// PUT /api/v1/products/:id
export const updateProductSchema = {
  params: z.object({
    id: z.string().uuid("Invalid product ID format"),
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
      id: z.string().uuid("Invalid category ID format"),
    }).optional(),
    sortOrder: z.number().int("Sort order must be integer").optional(),
    preparationTime: z.number().int("Preparation time must be integer").min(0, "Preparation time must be non-negative").optional(),
    isActive: z.boolean().optional(),
  }),
};

// DELETE /api/v1/products/:id
export const deleteProductSchema = {
  params: z.object({
    id: z.string().uuid("Invalid product ID format"),
  }),
};

// GET /api/v1/products/:slug
export const getProductBySlugSchema = {
  params: z.object({
    slug: z.string().min(1, "Slug is required"),
  }),
};
