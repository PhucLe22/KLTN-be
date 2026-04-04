export const adminTopProductsSchema = {
  query: z.object({
    limit: z.string().transform(Number).default("10"),
    storeId: z.string().uuid().optional(),
  }),
};
