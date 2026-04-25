import { z } from "zod";
import { OrderType } from "../../constants/enum.js";
import { VALIDATION_MESSAGES } from "../../constants/errors.js";
import { name, phone, address } from "../../contracts/common.schema.js";

// POST /api/v1/orders
export const createOrderInputSchema = {
  body: z.object({
    storeId: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
    type: z.nativeEnum(OrderType),
    note: z.string().max(255).optional(),
    voucherCode: z.string().optional(), // Mã giảm giá nếu có

    // Customer information for orders without account
    customerInfo: z.object({
      name,
      phone,
    }).optional(),

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
        receiverName: name,
        receiverPhone: phone,
        addressLine: address,
      })
      .optional(),
  }),
};

// GET /api/v1/orders/history
export const getOrderHistoryInputSchema = {
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
export const getOrderDetailInputSchema = {
  params: z.object({
    id: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
  }),
};

// GET /api/v1/orders/code/:orderCode
export const getOrderCodeInputSchema = {
  params: z.object({
    orderCode: z.string(),
  }),
};
