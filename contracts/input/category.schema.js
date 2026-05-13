import { z } from "zod";

// GET /api/v1/categories
export const getCategoriesSchema = {
  query: z.object({
    search: z.string().optional(),
    limit: z.string().transform(Number).optional().default("10"),
    page: z.string().transform(Number).optional().default("1"),
    sortBy: z.enum(["name", "sortOrder", "createdAt"]).optional().default("sortOrder"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
    isActive: z.enum(["true", "false"]).optional().default("true"),
  }),
};

// GET /api/v1/categories/:slug
export const getCategoryBySlugSchema = {
  params: z.object({
    slug: z.string(),
  }),
};

// POST /api/v1/categories
export const createCategorySchema = {
  body: z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().optional(),
    sortOrder: z.number().int("Sort order must be integer").optional(),
  }),
};

// PUT /api/v1/categories/:id
export const updateCategorySchema = {
  params: z.object({
    id: z.string().uuid("Invalid category ID format"),
  }),
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    slug: z.string().optional(),
    sortOrder: z.number().int("Sort order must be integer").optional(),
    isActive: z.boolean().optional(),
  }),
};

// DELETE /api/v1/categories/:id
export const deleteCategorySchema = {
  params: z.object({
    id: z.string().uuid("Invalid category ID format"),
  }),
};
