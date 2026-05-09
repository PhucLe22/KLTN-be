import { z } from "zod";
import { OrderType } from "../../constants/enum.js";
import { VALIDATION_MESSAGES } from "../../constants/errors.js";

// POST /api/v1/orders - Customer orders (authenticated)
export const createOrderSchema = {
  body: z.object({
    storeId: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
    type: z.nativeEnum(OrderType),
    note: z.string().max(255).optional(),
    voucherCode: z.string().optional(), // Mã giảm giá nếu có

    // Table number for DINE_IN (not used for TAKEAWAY)
    tableNumber: z.string().optional(),
    
    // Customer info for guest orders (not used for authenticated)
    customerInfo: z.object({
      phone: z.string(),
      name: z.string(),
      email: z.string().optional(),
    }).optional(),

    // Delivery info for DELIVERY orders
    deliveryInfo: z
      .object({
        receiverName: z.string(),
        receiverPhone: z.string(),
        addressLine: z.string(),
      })
      .optional(),

    // Order items
    items: z
      .array(
        z.object({
          productId: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
          quantity: z.number().int().min(1),
          note: z.string().optional(),
          // Product options (Size/Topping)
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
  }),
};

// POST /api/v1/orders/guest - Guest orders (no authentication)
export const createGuestOrderSchema = {
  body: z.object({
    storeId: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
    type: z.nativeEnum(OrderType),
    note: z.string().max(255).optional(),
    voucherCode: z.string().optional(), // Mã giảm giá nếu có

    // Table number for DINE_IN (not used for TAKEAWAY)
    tableNumber: z.string().optional(),
    
    // Customer info for guest orders (phone, name, address only)
    customerInfo: z.object({
      phone: z.string(),
      name: z.string(),
      address: z.string().optional(),
    }),

    // Order items
    items: z
      .array(
        z.object({
          productId: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
          quantity: z.number().int().min(1),
          note: z.string().optional(),
          // Product options (Size/Topping)
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

// POST /internal/staff/orders - Staff orders (cashier/manager)
export const createStaffOrderSchema = {
  body: z.object({
    storeId: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
    type: z.nativeEnum(OrderType),
    note: z.string().max(255).optional(),
    voucherCode: z.string().optional(), // Mã giảm giá nếu có

    // Table number for DINE_IN (not used for TAKEAWAY)
    tableNumber: z.string().optional(),
    
    // Customer info for staff orders (existing customer or new customer)
    customerInfo: z.object({
      phone: z.string().optional(), // For existing customer lookup
      name: z.string(),
      email: z.string().optional(),
      address: z.string().optional(),
    }).optional(),

    // Order items
    items: z
      .array(
        z.object({
          productId: z.string().uuid(VALIDATION_MESSAGES.ID_INVALID),
          quantity: z.number().int().min(1),
          note: z.string().optional(),
          // Product options (Size/Topping)
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
  }),
};

// GET /api/v1/orders/code/:orderCode
export const getOrderCodeSchema = {
  params: z.object({
    orderCode: z.string(),
  }),
};
