import { z } from "zod";

// POST /api/v1/orders - Response format
export const createOrderSchema = {
  response: z.object({
    store: z.object({
      name: z.string(),
      address: z.string()
    }),
    customer: z.object({
      name: z.string().nullable(),
      phone: z.string().nullable(),
      address: z.string().nullable()
    }).nullable(),
    status: z.string(),
    type: z.string(),
    subtotal: z.number(),
    serviceFee: z.number(),
    tax: z.number(),
    discount: z.number(),
    total: z.number(),
    note: z.string().nullable(),
    tableNumber: z.string().nullable(),
    createdBy: z.object({
      staff_id: z.string()
    }).nullable(),
    createdAt: z.date(),
    orderCode: z.string().nullable()
  })
};

// GET /api/v1/orders/code/:orderCode - Response format
export const getOrderCodeSchema = {
  response: z.object({
    id: z.string(),
    store: z.object({
      name: z.string(),
      address: z.string()
    }),
    customer: z.object({
      name: z.string().nullable(),
      phone: z.string().nullable(),
      address: z.string().nullable()
    }).nullable(),
    status: z.string(),
    type: z.string(),
    subtotal: z.number(),
    serviceFee: z.number(),
    tax: z.number(),
    discount: z.number(),
    total: z.number(),
    note: z.string().nullable(),
    tableNumber: z.string().nullable(),
    createdBy: z.object({
      staff_id: z.string()
    }).nullable(),
    createdAt: z.date(),
    orderCode: z.string().nullable(),
    orderItems: z.array(z.object({
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
      discount: z.number(),
      tax: z.number(),
      note: z.string().nullable()
    }))
  })
};

// GET /api/v1/orders - Response format
export const getOrderSchema = {
  response: z.object({
    id: z.string(),
    status: z.string(),
    type: z.string(),
    subtotal: z.number(),
    discount: z.number(),
    tax: z.number(),
    serviceFee: z.number(),
    total: z.number(),
    note: z.string().nullable(),
    tableNumber: z.string().nullable(),
    createdAt: z.date(),
    store: z.object({
      id: z.string(),
      name: z.string(),
      address: z.string(),
    }),
    customer: z.object({
      id: z.string(),
      name: z.string().nullable(),
      phone: z.string().nullable(),
      tier: z.string(),
    }).nullable(),
    createdBy: z.object({
      staff_id: z.string()
    }).nullable(),
  })
};
