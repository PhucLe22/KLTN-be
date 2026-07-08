import { z } from "zod";
import * as f from "../common.schema.js";

export const createAddressSchema = {
  body: z.object({
    receiverName: z.string().optional().nullable(),
    receiverPhone: f.phone.optional().nullable(),
    addressLine: z.string().min(1),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
    label: z.string().optional().nullable(),
    isDefault: z.boolean().optional().default(false),
    customerId: f.id.optional().nullable(),
    storeId: f.id.optional().nullable(),
  }),
};

export const updateAddressSchema = {
  params: z.object({
    id: f.id,
  }),
  body: z.object({
    receiverName: z.string().optional().nullable(),
    receiverPhone: f.phone.optional().nullable(),
    addressLine: z.string().optional(),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
    label: z.string().optional().nullable(),
    isDefault: z.boolean().optional(),
  }),
};

export const setDefaultAddressSchema = {
  params: z.object({
    id: f.id,
  }),
};
