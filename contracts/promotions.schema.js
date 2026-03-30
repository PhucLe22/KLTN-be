// GET /api/v1/promotions/available
export const getAvailableVouchersSchema = {
  query: z.object({
    storeId: z.string().uuid().optional(),
    orderAmount: z.string().transform(Number).optional(),
  }),
};
