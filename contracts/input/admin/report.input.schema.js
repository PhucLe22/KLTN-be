import { z } from "zod";
import * as f from "../common.schema.js";

export const adminRevenueReport = {
  query: z.object({
    fromDate: z.string().datetime().optional(), // ISO String
    toDate: z.string().datetime().optional(),
    storeId: f.id.optional(), // Lọc theo chi nhánh
    groupBy: z.enum(["day", "month", "year"]).default("day"),
  }),
};
