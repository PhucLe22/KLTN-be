import { createOrderSchema, getOrderCodeSchema } from "../contracts/output/order.output.schema.js";

export class OrderMapper {
  static toCreateResponse(result) {
    return createOrderSchema.response.parse({
      store: {
        name: result.store.name,
        address: result.store.address,
      },
      customer: {
        name: result.customer?.name || null,
        phone: result.customer?.phone || "",
        address: result.customer?.address || null,
      },
      status: result.status,
      type: result.type,
      subtotal: Number(result.subtotal),
      serviceFee: Number(result.serviceFee),
      tax: Number(result.tax),
      discount: Number(result.discount),
      total: Number(result.total),
      note: result.note,
      createdBy: result.createdBy
        ? { name: result.createdBy.name }
        : { name: "Guest" },
      createdAt: result.createdAt,
      orderCode: result.orderCode,
    });
  }

  static toGetOrderCodeResponse(result) {
    return getOrderCodeSchema.response.parse({
      id: result.id,
      store: {
        name: result.store.name,
        address: result.store.address,
      },
      customer: {
        name: result.customer?.name || null,
        phone: result.customer?.phone || "",
        address: result.customer?.address || null,
      },
      status: result.status,
      type: result.type,
      subtotal: Number(result.subtotal),
      serviceFee: Number(result.serviceFee),
      tax: Number(result.tax),
      discount: Number(result.discount),
      total: Number(result.total),
      note: result.note,
      createdBy: result.createdBy
        ? { name: result.createdBy.name }
        : { name: "Guest" },
      createdAt: result.createdAt,
      orderCode: result.orderCode,
      orderItems: result.items.map(item => ({
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        discount: Number(item.discount),
        tax: Number(item.tax),
        note: item.note
      }))
    });
  }
}
