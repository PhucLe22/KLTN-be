import { z } from "zod";
import { VALIDATION_MESSAGES } from "../../constants/errors.js";
import * as f from "../common.schema.js";

export const internalPayment = {
  body: z.object({
    orderId: f.id,
    amount: z.number().positive(),
    pin: z.string().min(6, VALIDATION_MESSAGES.PIN_INVALID),
  }),
};

export const createVnpayPayment = {
  body: z.object({
    orderId: f.id,
    returnUrl: z.string().url("returnUrl phải là URL hợp lệ"),
  }),
};
