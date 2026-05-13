import { z } from "zod";

// GET /api/v1/categories
export const getCategoriesSchema = {
  response: z.object({
    items: z.array(z.object({
      id: z.string(),
      name: z.string(),
      sortOrder: z.number().nullable(),
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

// GET /api/v1/categories/:slug
export const getCategoryBySlugSchema = {
  response: z.object({
    id: z.string(),
    name: z.string(),
    sortOrder: z.number().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
};

// POST /api/v1/categories
export const createCategorySchema = {
  response: z.object({
    id: z.string(),
    name: z.string(),
    sortOrder: z.number().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
  }),
};

// PUT /api/v1/categories/:id
export const updateCategorySchema = {
  response: z.object({
    id: z.string(),
    name: z.string(),
    sortOrder: z.number().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
};

// DELETE /api/v1/categories/:id
export const deleteCategorySchema = {
  response: z.object({
    message: z.string(),
  }),
};
