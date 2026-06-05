import { z } from "zod";
import { VALIDATION_MESSAGES } from "../../constants/errors.js";
import * as f from "../common.schema.js";

// POST /api/v1/payments/internal-transfer
// (Ví dụ thanh toán bằng điểm hoặc ví nội bộ)
export const internalPayment = {
  body: z.object({
    orderId: f.id,
    amount: z.number().positive(),
    pin: z.string().min(6, VALIDATION_MESSAGES.PIN_INVALID), // Giả sử có mã PIN xác thực
  }),
};
