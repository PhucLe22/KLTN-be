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
    const response = {
      store: {
        name: result.store.name,
        address: result.store.address,
      },
      customer: result.customer ? {
        name: result.customer.name || null,
        phone: result.customer.phone || null,
        address: result.customer.email || null, // Assuming email as address if address is not available in Customer model
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
    };

    return createOrderSchema.response.parse(response);
  }

  static toGetOrderCodeResponse(result) {
    const response = {
      id: result.id,
      store: {
        name: result.store.name,
        address: result.store.address,
      },
      customer: result.customer ? {
        name: result.customer.name || null,
        phone: result.customer.phone || null,
        address: result.customer.email || null,
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
        note: item.note || null,
        options: item.options?.map(opt => ({
          name: opt.name,
          price: Number(opt.price)
        }))
      }))
    };

    return getOrderCodeSchema.response.parse(response);
  }

  static toGetOrderResponse(result) {
    return {
      items: result.items.map(item => {
        const orderData = {
          id: item.id,
          orderCode: item.orderCode,
          status: item.status,
          type: item.type,
          subtotal: Number(item.subtotal),
          discount: Number(item.discount),
          tax: Number(item.tax),
          serviceFee: Number(item.serviceFee),
          total: Number(item.total),
          note: item.note || null,
          address: item.delivery?.addressLine || null,
          tableNumber: item.tableNumber || null,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
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
          createdBy: item.createdBy || null,
        };
        return getOrderSchema.response.parse(orderData);
      }),
      meta: result.meta,
    };
  }
}
