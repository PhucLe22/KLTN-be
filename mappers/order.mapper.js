import { createOrderSchema, getOrderSchema, getOrderCodeSchema } from "../contracts/output/order.output.schema.js";
import { OrderStatus } from "../constants/enum.js";

export class OrderCreateMapper {
  static toCreateRequest({
    storeId,
    customerId,
    type,
    subtotal,
    discount,
    tax,
    serviceFee,
    total,
    note,
    tableNumber,
    createdByStaffId,
    orderItems,
  }) {
    return {
      storeId,
      customerId,
      type,
      status: OrderStatus.NEW,
      subtotal,
      discount,
      tax,
      serviceFee,
      total,
      note,
      tableNumber,
      createdByStaffId,
      items: {
        create: orderItems,
      },
    };
  }
}

export class OrderMapper {
  static toCreateResponse(result) {
    return createOrderSchema.response.parse({
      store: {
        name: result.store.name,
        address: result.store.address,
      },
      customer: {
        name: result.customer?.name || null,
        phone: result.customer?.phone || null,
        address: result.customer?.address || null,
      },
      status: result.status,
      type: result.type,
      subtotal: Number(result.subtotal),
      serviceFee: Number(result.serviceFee),
      tax: Number(result.tax),
      discount: Number(result.discount),
      total: Number(result.total),
      note: result.note || null,
      tableNumber: result.tableNumber || null,
      createdBy: result.createdBy ? { staff_id: result.createdBy } : null,
      createdAt: result.createdAt,
      orderCode: result.orderCode || null,
    });
  }

  static toGetOrderCodeResponse(result) {
    return getOrderCodeSchema.response.parse({
      id: result.id,
      store: {
        name: result.store.name,
        address: result.store.address,
      },
      customer: result.customer ? {
        name: result.customer.name || null,
        phone: result.customer.phone || null,
        address: result.customer.address || null,
      } : null,
      status: result.status,
      type: result.type,
      subtotal: Number(result.subtotal),
      serviceFee: Number(result.serviceFee),
      tax: Number(result.tax),
      discount: Number(result.discount),
      total: Number(result.total),
      note: result.note || null,
      tableNumber: result.tableNumber || null,
      createdBy: result.createdBy ? { staff_id: result.createdBy } : null,
      createdAt: result.createdAt,
      orderCode: result.orderCode,
      orderItems: result.items.map(item => ({
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        discount: Number(item.discount),
        tax: Number(item.tax),
        note: item.note || null
      }))
    });
  }

  static toGetOrderResponse(result) {
    return {
      items: result.items.map(item =>
        getOrderSchema.response.parse({
          id: item.id,
          status: item.status,
          type: item.type,
          subtotal: Number(item.subtotal),
          discount: Number(item.discount),
          tax: Number(item.tax),
          serviceFee: Number(item.serviceFee),
          total: Number(item.total),
          note: item.note || null,
          tableNumber: item.tableNumber || null,
          createdAt: item.createdAt,
          store: {
            id: item.store.id,
            name: item.store.name,
            address: item.store.address,
          },
          customer: item.customer ? {
            id: item.customer.id,
            name: item.customer.name || null,
            phone: item.customer.phone || null,
            tier: item.customer.tier,
          } : null,
          createdBy: item.createdBy ? { staff_id: item.createdBy } : null,
        })
      ),
      meta: result.meta,
    };
  }
}
