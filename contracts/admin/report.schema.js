export const adminRevenueReportSchema = {
  query: z.object({
    fromDate: z.string().datetime().optional(), // ISO String
    toDate: z.string().datetime().optional(),
    storeId: z.string().uuid().optional(), // Lọc theo chi nhánh
    groupBy: z.enum(["day", "month", "year"]).default("day"),
  }),
};

export const adminTopProductsSchema = {
  query: z.object({
    limit: z.string().transform(Number).default("10"),
    storeId: z.string().uuid().optional(),
  }),
};
