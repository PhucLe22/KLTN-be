// GET /api/v1/stores
export const getStoresSchema = {
  query: z.object({
    lat: z.string().transform(Number).optional(),
    lng: z.string().transform(Number).optional(),
  }),
};
