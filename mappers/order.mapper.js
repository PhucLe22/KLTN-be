import { createOrderOutputSchema, getOrderCodeOutputSchema, getOrderHistoryOutputSchema } from "../contracts/output/order.output.schema.js";

export class OrderMapper {
  static toCreateResponse(result) {
    return createOrderOutputSchema.response.parse({
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
        : result.customer
          ? { name: result.customer.name }
          : { name: "Guest" },
      createdAt: result.createdAt,
      // orderCode: result.orderCode || null,
    });
  }

  static toGetOrderCodeResponse(result) {
    return getOrderCodeOutputSchema.response.parse({
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
      orderCode: result.orderCode || null,
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

  static toGetOrderHistoryResponse(result) {
    return {
      orders: result.items.map(item =>
        getOrderHistoryOutputSchema.response.parse({
          id: item.id,
          total: Number(item.total),
          address: item.store?.address || '',
          updatedAt: item.updatedAt,
          status: item.status,
        })
      ),
      meta: result.meta,
    };
  }

  static toGetOrderByIdResponse(result) {
    return {
      store: {
        name: result.store.name,
        address: result.store.address
      },
      customer: {
        name: result.customer?.name || null,
        phone: result.customer?.phone || "",
        address: result.customer?.address || null
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
      orderCode: result.orderCode || null,
      orderItems: result.items.map(item => ({
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        discount: Number(item.discount),
        tax: Number(item.tax),
        note: item.note
      }))
    };
  }
}
