// POST /api/v1/payments/internal-transfer
// (Ví dụ thanh toán bằng điểm hoặc ví nội bộ)
export const internalPaymentSchema = {
  body: z.object({
    orderId: z.string().uuid(),
    amount: z.number().positive(),
    pin: z.string().min(6, "Mã PIN phải có 6 số"), // Giả sử có mã PIN xác thực
  }),
};
