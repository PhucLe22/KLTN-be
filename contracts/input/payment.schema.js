import { z } from "zod";
import { VALIDATION_MESSAGES } from "../../constants/errors.js";
import { id } from "../../contracts/common.schema.js";

// POST /api/v1/payments/internal-transfer
// (Ví dụ thanh toán bằng điểm hoặc ví nội bộ)
export const internalPaymentSchema = {
  body: z.object({
    orderId: id,
    amount: z.number().positive(),
    pin: z.string().min(6, VALIDATION_MESSAGES.PIN_INVALID), // Giả sử có mã PIN xác thực
  }),
};
