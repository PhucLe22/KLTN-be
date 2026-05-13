import { z } from "zod";
import { ProductType } from "../../constants/enum.js";

// GET /api/v1/products
export const getProductsSchema = {
  response: z.object({
    items: z.array(z.object({
      id: z.string(),
      sku: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      type: z.enum(Object.values(ProductType)),
      basePrice: z.number(),
      costPrice: z.number().nullable(),
      taxRate: z.number(),
      thumbnail: z.string().nullable(),
      images: z.array(z.string()),
      categoryId: z.string().nullable(),
      category: z.object({
        id: z.string(),
        name: z.string()
      }).nullable().optional(),
      sortOrder: z.number().nullable(),
      preparationTime: z.number().nullable(),
      isActive: z.boolean(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })),
    meta: z.object({
      totalItems: z.number(),
      currentPage: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
    }),
  }),
};

// POST /api/v1/products
export const createProductSchema = {
  response: z.object({
    id: z.string(),
    sku: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    type: z.enum(Object.values(ProductType)),
    basePrice: z.number(),
    costPrice: z.number().nullable(),
    taxRate: z.number(),
    thumbnail: z.string().nullable(),
    images: z.array(z.string()),
    categoryId: z.string().nullable(),
    category: z.object({
      id: z.string(),
      name: z.string(),
    }).nullable().optional(),
    sortOrder: z.number().nullable(),
    preparationTime: z.number().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
  }),
};

// PUT /api/v1/products/:id
export const updateProductSchema = {
  response: z.object({
    id: z.string(),
    sku: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    type: z.enum(Object.values(ProductType)),
    basePrice: z.number(),
    costPrice: z.number().nullable(),
    taxRate: z.number(),
    thumbnail: z.string().nullable(),
    images: z.array(z.string()),
    categoryId: z.string().nullable(),
    category: z.object({
      id: z.string(),
      name: z.string(),
    }).nullable().optional(),
    sortOrder: z.number().nullable(),
    preparationTime: z.number().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
};

// DELETE /api/v1/products/:id
export const deleteProductSchema = {
  response: z.object({
    message: z.string(),
  }),
};
