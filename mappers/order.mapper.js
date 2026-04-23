import { createOrderSchema, getOrderCodeSchema, getOrderHistorySchema } from "../contracts/output/order.output.schema.js";

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
        : result.customer
          ? { name: result.customer.name }
          : { name: "Guest" },
      createdAt: result.createdAt,
      // orderCode: result.orderCode || null,
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
      items: result.items.map(item =>
        getOrderHistorySchema.response.parse({
          id: item.id,
          orderCode: item.orderCode || null,
          status: item.status,
          type: item.type,
          subtotal: Number(item.subtotal),
          discount: Number(item.discount),
          tax: Number(item.tax),
          serviceFee: Number(item.serviceFee),
          total: Number(item.total),
          note: item.note,
          createdAt: item.createdAt,
          store: {
            id: item.store.id,
            name: item.store.name,
            address: item.store.address,
          },
          customer: item.customer ? {
            id: item.customer.id,
            name: item.customer.name,
            phone: item.customer.phone,
            tier: item.customer.tier,
          } : null,
          createdByStaffId: item.createdByStaffId,
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
