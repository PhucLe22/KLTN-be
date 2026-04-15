import { z } from "zod";
import { OrderType } from "../../constants/enum.js";
import { VALIDATION_MESSAGES } from "../../constants/errors.js";

// POST /api/v1/orders
export const createOrderSchema = {
  body: z.object({
    storeId: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
    customerId: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID).optional(), // Optional for guest orders
    type: z.nativeEnum(OrderType),
    note: z.string().max(255).optional(),
    voucherCode: z.string().optional(), // Mã giảm giá nếu có

    // Danh sách món ăn
    items: z
      .array(
        z.object({
          productId: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
          quantity: z.number().int().min(1),
          note: z.string().optional(),
          // Nếu có option (Size/Topping)
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
      .min(1, VALIDATION_MESSAGES.ITEMS_MIN),

    // Nếu type là DELIVERY thì cần thông tin nhận hàng
    deliveryInfo: z
      .object({
        receiverName: z.string(),
        receiverPhone: z.string(),
        addressLine: z.string(),
      })
      .optional(),
  }),
};

// GET /api/v1/orders/history
export const getOrderHistorySchema = {
  query: z.object({
    storeId: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    status: z
      .enum([
        "NEW",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "COMPLETED",
        "CANCELLED",
        "REFUNDED",
      ])
      .optional(),
  }),
};

// GET /api/v1/orders/:id
export const getOrderDetailSchema = {
  params: z.object({
    id: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
  }),
};

// GET /api/v1/orders/code/:orderCode
export const getOrderCodeSchema = {
  params: z.object({
    orderCode: z.string(),
  }),
};
