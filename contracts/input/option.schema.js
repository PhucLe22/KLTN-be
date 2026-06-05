import { z } from "zod";

export const createOptionGroup = {
  body: z.object({
    name: z.string().min(1, "Name is required"),
    isRequired: z.boolean().optional().default(false),
    isMultiple: z.boolean().optional().default(false),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional().default(true),
    options: z.array(
      z.object({
        name: z.string().min(1, "Option name is required"),
        basePrice: z.number().min(0, "Base price must be non-negative").default(0),
        sortOrder: z.number().int().optional(),
        isActive: z.boolean().optional().default(true),
      })
    ).optional(),
  }),
};
