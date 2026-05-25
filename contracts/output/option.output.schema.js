import { z } from "zod";

const optionSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  name: z.string(),
  basePrice: z.number(),
  sortOrder: z.number().nullable().optional(),
  isActive: z.boolean(),
});

const optionGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  isRequired: z.boolean(),
  isMultiple: z.boolean(),
  sortOrder: z.number().nullable().optional(),
  isActive: z.boolean(),
  options: z.array(optionSchema).optional(),
});

export const createOptionGroupSchema = {
  response: optionGroupSchema,
};
