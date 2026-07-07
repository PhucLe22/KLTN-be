import { z } from "zod";
import { OrderType } from "../../constants/enum.js";
import { VALIDATION_MESSAGES } from "../../constants/errors.js";
import * as f from "../common.schema.js";

// POST /api/v1/orders - Customer orders (authenticated)
export const createOrder = {
  body: z.object({
    storeId: f.id.optional(),
    type: z.nativeEnum(OrderType),
    note: z.string().max(255).optional(),
    voucherCode: z.string().optional(), // Mã giảm giá nếu có

    // Table number for DINE_IN (not used for TAKEAWAY)
    tableNumber: z.string().optional(),
    
    // Customer info for guest orders (not used for authenticated)
    customerInfo: z.object({
      phone: f.phone,
      name: z.string(),
      email: f.email.optional(),
    }).optional(),

    // Delivery info for DELIVERY orders
    deliveryInfo: z
      .object({
        receiverName: z.string(),
        receiverPhone: z.string(),
        addressLine: z.string(),
        lat: z.number().optional().nullable(),
        lng: z.number().optional().nullable(),
      })
      .optional(),

    // Order items
    items: z
      .array(
        z.object({
          productId: f.id,
          quantity: z.number().int().min(1),
          note: z.string().optional(),
          // Product options (Size/Topping)
          options: z
            .array(
              z.object({
                optionId: f.id,
              }),
            )
            .optional(),
        }),
      )
      .min(1, VALIDATION_MESSAGES.ITEMS_MIN),

  }),
};

// POST /api/v1/orders/guest - Guest orders (no authentication)
export const createGuestOrder = {
  body: z.object({
    storeId: f.id,
    type: z.nativeEnum(OrderType),
    note: z.string().max(255).optional(),
    voucherCode: z.string().optional(), // Mã giảm giá nếu có

    // Table number for DINE_IN (not used for TAKEAWAY)
    tableNumber: z.string().optional(),
    
    // Customer info for guest orders (phone, name, address only)
    customerInfo: z.object({
      phone: f.phone,
      name: z.string(),
      address: z.string().optional(),
    }),

    // Order items
    items: z
      .array(
        z.object({
          productId: f.id,
          quantity: z.number().int().min(1),
          note: z.string().optional(),
          // Product options (Size/Topping)
          options: z
            .array(
              z.object({
                optionId: f.id,
              }),
            )
            .optional(),
        }),
      )
      .min(1, VALIDATION_MESSAGES.ITEMS_MIN),

  }),
};

// GET /api/v1/orders
export const getOrders = {
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    status: z.enum([
      "NEW",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "DELIVERING",
      "COMPLETED",
      "CANCELLED",
      "REFUNDED",
    ]).optional(),
    type: z.nativeEnum(OrderType).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    minTotal: z.string().optional().transform(v => v ? Number(v) : undefined),
    maxTotal: z.string().optional().transform(v => v ? Number(v) : undefined),
    store_id: f.id.optional(),
  }),
};

// GET /api/v1/orders/history
export const getOrderHistory = {
  query: z.object({
    storeId: f.id,
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    status: z
      .enum([
        "NEW",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "DELIVERING",
        "COMPLETED",
        "CANCELLED",
        "REFUNDED",
      ])
      .optional(),
  }),
};

// GET /api/v1/orders/:id
export const getOrderDetail = {
  params: z.object({
    id: f.id,
  }),
};

// POST /internal/staff/orders - Staff orders (cashier/manager)
export const createStaffOrder = {
  body: z.object({
    type: z.nativeEnum(OrderType),
    note: z.string().max(255).optional(),
    voucherCode: z.string().optional(), // Mã giảm giá nếu có

    // Table number for DINE_IN (not used for TAKEAWAY)
    tableNumber: z.string().optional(),
    
    // Customer phone for lookup
    phone: z.string(),

    // Delivery info for DELIVERY orders
    deliveryInfo: z
      .object({
        receiverName: z.string(),
        receiverPhone: z.string(),
        addressLine: z.string(),
        lat: z.number().optional().nullable(),
        lng: z.number().optional().nullable(),
      })
      .optional(),

    // Order items
    items: z
      .array(
        z.object({
          productId: f.id,
          quantity: z.number().int().min(1),
          note: z.string().optional(),
          // Product options (Size/Topping)
          options: z
            .array(
              z.object({
                optionId: f.id,
              }),
            )
            .optional(),
        }),
      )
      .min(1, VALIDATION_MESSAGES.ITEMS_MIN),
  }),
};

// PATCH /orders/:id/status
export const updateOrderStatus = {
  params: z.object({
    id: f.id,
  }),
  body: z.object({
    status: z.enum([
      "NEW",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "DELIVERING",
      "COMPLETED",
      "CANCELLED",
      "REFUNDED",
    ]),
  }),
};

// GET /api/v1/orders/code/:orderCode
export const getOrderCode = {
  params: z.object({
    orderCode: z.string(),
  }),
};
