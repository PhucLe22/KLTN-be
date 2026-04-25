import { z } from "zod";
import { OrderType, OrderStatus } from "../../constants/enum.js";
import { VALIDATION_MESSAGES } from "../../constants/errors.js";

export const staffCreateOrderOutputSchema = {
  response: z.object({
    // StoreId sẽ lấy từ JWT, không cần client gửi
    customerId: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID).optional(),
    type: z.enum(Object.values(OrderType)),
    note: z.string().optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
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
      .min(1, VALIDATION_MESSAGES.ORDER_ITEMS_REQUIRED),
    paymentMethod: z.string().optional(), // Staff thường chọn CASH tại quầy
  }),
};

export const updateOrderStatusOutputSchema = {
  response: z.object({
    id: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
    status: z.enum([
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
    ]),
  }),
};
