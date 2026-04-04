import { z } from "zod";
import { OrderType, OrderStatus } from "../../constants/enum.js";

export const staffCreateOrderSchema = {
  body: z.object({
    // StoreId sẽ lấy từ JWT, không cần client gửi
    customerId: z.string().uuid().optional(),
    type: z.enum(Object.values(OrderType)),
    note: z.string().optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().int().min(1),
          options: z
            .array(
              z.object({
                name: z.string(),
                price: z.number(),
              }),
            )
            .optional(),
        }),
      )
      .min(1, "Đơn hàng phải có sản phẩm"),
    paymentMethod: z.string().optional(), // Staff thường chọn CASH tại quầy
  }),
};

export const updateOrderStatusSchema = {
  params: z.object({
    id: z.string().uuid("ID đơn hàng không hợp lệ"),
  }),
  body: z.object({
    status: z.enum([
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
    ]),
  }),
};
