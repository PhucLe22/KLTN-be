import { z } from 'zod';
import { OrderType, PaymentMethod } from '../enums/order.status.enum.js';

// Create Order DTO
export const createOrderDto = z.object({
  storeId: z.string().uuid(),
  type: z.nativeEnum(OrderType),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(1),
    options: z.array(z.object({
      optionId: z.string().uuid(),
      quantity: z.number().min(1)
    })).optional().default([])
  })).min(1, "Order must have at least one item"),
  note: z.string().optional(),
  // For delivery orders
  deliveryAddress: z.string().optional(),
  deliveryPhone: z.string().optional(),
  // Payment info
  paymentMethod: z.nativeEnum(PaymentMethod),
  // Voucher codes (optional)
  voucherCodes: z.array(z.string()).optional().default([])
});

// Order Query DTO
export const orderQueryDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  customerId: z.string().uuid().optional(),
  status: z.string().optional()
});

// Order Response DTO
export const orderResponseDto = z.object({
  store: z.object({
    name: z.string(),
    address: z.string()
  }),
  customer: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string().optional()
  }).optional(),
  status: z.string(),
  type: z.string(),
  subtotal: z.number(),
  serviceFee: z.number(),
  tax: z.number(),
  discount: z.number(),
  total: z.number(),
  note: z.string().optional(),
  createdBy: z.object({
    name: z.string()
  }).optional(),
  createdAt: z.string().datetime(),
  orderCode: z.string()
});