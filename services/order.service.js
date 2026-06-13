import { orderRepository } from "../repositories/order.repository.js";
import { customerRepository } from "../repositories/customer.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { staffRepository } from "../repositories/staff.repository.js";
import { storeRepository } from "../repositories/store.repository.js";
import { prisma } from "../lib/prisma.js";
import { ERR } from "../lib/httpExceptions.js";
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from "../constants/errors.js";
import { OrderType, OrderStatus, StaffRole, DeliveryStatus, ROOT_USER_ID } from "../constants/enum.js";
import { buildOrderFilters } from "../lib/buildOrderFilters.js";

class OrderService  {

  // Customer (Auth) 
  // Staff (Auth) create order for Guest (user_id?)/ Customer

  // body
  // findByNameOrPhone
  // If true return createOrder 
  // else return error (add enum for error message)

  async createOrder(body, user) {
    return await prisma.$transaction(async (tx) => {
      const { storeId, type, items, note, tableNumber, deliveryInfo } = body;

      const { orderItems, subtotal } = await this.#buildOrderItems(items, tx);
      const totals = this.#calculateTotals(subtotal, type);

      const customer = await customerRepository.findCustomerByUserId(user.id, tx);
      if (!customer) {
        throw ERR.NotFound(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      const customerId = customer.id;

      const orderData = {
        orderCode: this.#generateOrderCode(type),
        storeId,
        type,
        subtotal,
        ...totals,
        note,
        tableNumber: type === OrderType.DINE_IN ? tableNumber : null,
        customerId,
        items: { create: orderItems },
        createdBy: user.id, // Set createdBy to the user ID (Customer)
      };

      // Handle Delivery info if applicable
      if (type === OrderType.DELIVERY && deliveryInfo) {
        console.log("[OrderService] Creating nested delivery order with data:", deliveryInfo);
        orderData.delivery = {
          create: {
            storeId,
            receiverName: deliveryInfo.receiverName,
            receiverPhone: deliveryInfo.receiverPhone,
            addressLine: deliveryInfo.addressLine,
          }
        };
      }

      console.log("[OrderService] Final orderData object:", JSON.stringify(orderData, null, 2));
      const order = await orderRepository.create(orderData, tx);

      // Record initial event for delivery order
      if (type === OrderType.DELIVERY) {
        const delivery = await tx.deliveryOrder.findUnique({
          where: { orderId: order.id }
        });
        if (delivery) {
          await tx.deliveryEvent.create({
            data: {
              deliveryId: delivery.id,
              status: OrderStatus.NEW,
              note: "Đơn hàng đã được đặt thành công",
            }
          });
        }
      }

      return await orderRepository.findByIdWithRelations(order.id, tx);
    });
  }

  async createOrderForStaff(storeId, body, user) {
    return await prisma.$transaction(async (tx) => {
      const { type, items, note, tableNumber, phone, deliveryInfo } = body;

      const { orderItems, subtotal } = await this.#buildOrderItems(items, tx);
      const totals = this.#calculateTotals(subtotal, type);

      const customer = await customerRepository.findByPhone(phone, tx);
      if (!customer) {
        throw ERR.NotFound(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      
      const customerId = customer.id;

      const orderData = {
        orderCode: this.#generateOrderCode(type),
        storeId,
        type,
        subtotal,
        ...totals,
        note,
        tableNumber: type === OrderType.DINE_IN ? tableNumber : null,
        customerId,
        items: { create: orderItems },
        createdBy: user?.id, // Set createdBy to the user ID (Staff)
      };

      // Handle Delivery info if applicable
      if (type === OrderType.DELIVERY && deliveryInfo) {
        console.log("[OrderService] Creating nested delivery order with data:", deliveryInfo);
        orderData.delivery = {
          create: {
            storeId,
            receiverName: deliveryInfo.receiverName,
            receiverPhone: deliveryInfo.receiverPhone,
            addressLine: deliveryInfo.addressLine,
          }
        };
      }

      console.log("[OrderService] Final orderData object:", JSON.stringify(orderData, null, 2));
      const order = await orderRepository.create(orderData, tx);

      // Record initial event for delivery order
      if (type === OrderType.DELIVERY) {
        const delivery = await tx.deliveryOrder.findUnique({
          where: { orderId: order.id }
        });
        if (delivery) {
          await tx.deliveryEvent.create({
            data: {
              deliveryId: delivery.id,
              status: OrderStatus.NEW,
              note: "Đơn hàng đã được đặt thành công (bởi nhân viên)",
            }
          });
        }
      }

      return await orderRepository.findByIdWithRelations(order.id, tx);
    });
  }

  async findByOrderCode(orderCode) {
    const order = await orderRepository.findByOrderCode(orderCode);

    if (!order) {
      throw ERR.NotFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    // Get staff info for createdBy
    const createdBy = await this.#getStaffInfoById(order.createdBy);

    return {
      ...order,
      createdBy,
    };
  }

  async getOrders(userId, query = {}) {
    const filters = buildOrderFilters({ userId, query });
    const result = await orderRepository.getOrdersByFilters(filters);

    const enrichedItems = await this.#enrichOrdersWithStaffInfo(result.items);

    return {
      items: enrichedItems,
      meta: result.meta,
    };
  }

  async getOrdersForStaff(storeId, query = {}) {
    const filters = buildOrderFilters({ storeId, query });
    const result = await orderRepository.getOrdersByFilters(filters);

    const enrichedItems = await this.#enrichOrdersWithStaffInfo(result.items);

    return {
      items: enrichedItems,
      meta: result.meta,
    };
  }

  async getOrdersByStoreId(storeId, query = {}, user) {
    // 1. Check if store exists
    const store = await storeRepository.findById(storeId);
    if (!store) {
      throw ERR.NotFound(VALIDATION_MESSAGES.STORE_NOT_FOUND);
    }

    // 2. Permission check: Staff can only view their own store unless they are ADMIN/OWNER
    if (user.staff && 
        user.staff.role !== "ADMIN" && 
        user.staff.role !== "OWNER" && 
        user.staff.storeId !== storeId) {
      throw ERR.Forbidden(ERROR_MESSAGES.FORBIDDEN);
    }

    return await orderRepository.getOrdersByStoreId(storeId, query);
  }

  async #enrichOrdersWithStaffInfo(orders) {
    return await Promise.all(
      orders.map(async (order) => {
        const createdBy = await this.#getStaffInfoById(order.createdBy);
        return {
          ...order,
          createdBy,
        };
      })
    );
  }

  async updateStatus(id, status, user) {
    return await prisma.$transaction(async (tx) => {
      const order = await orderRepository.findByIdWithRelations(id, tx);

      if (!order) {
        throw ERR.NotFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
      }

      // Nếu là STAFF/MANAGER/CASHIER, chỉ được update order của store mình
      if (user.staff && 
          user.staff.role !== StaffRole.ADMIN && 
          user.staff.role !== StaffRole.OWNER && 
          order.storeId !== user.staff.storeId) {
        throw ERR.Forbidden(ERROR_MESSAGES.FORBIDDEN);
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status },
        include: {
          delivery: true,
          store: true,
          customer: true,
          items: true,
        }
      });

      // Record Delivery Event if it's a delivery order
      if (updatedOrder.delivery) {
        let note = `Trạng thái đơn hàng thay đổi thành ${status}`;
        
        // Custom notes based on status
        if (status === OrderStatus.CONFIRMED) note = "Đơn hàng đã được xác nhận";
        else if (status === OrderStatus.PREPARING) note = "Cửa hàng đang chuẩn bị món ăn";
        else if (status === OrderStatus.READY) note = "Đơn hàng đã sẵn sàng để giao";
        else if (status === OrderStatus.CANCELLED) note = "Đơn hàng đã bị hủy";

        await tx.deliveryEvent.create({
          data: {
            deliveryId: updatedOrder.delivery.id,
            status: status,
            note: note,
          }
        });
      }

      return updatedOrder;
    });
  }

  async getOrderActivities(id, user) {
    const order = await orderRepository.findByIdWithRelations(id);

    if (!order) {
      throw ERR.NotFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    // Security check: Only customer who own the order or staff can see activities
    if (order.customerId !== user.customer?.id && !user.staff) {
      throw ERR.Forbidden(ERROR_MESSAGES.FORBIDDEN);
    }

    if (!order.delivery) {
      // For non-delivery orders, synthesized timeline from order createdAt/updatedAt
      // or return just the basic placed event
      return [
        {
          status: OrderStatus.NEW,
          createdAt: order.createdAt,
          note: "Đơn hàng đã được đặt thành công",
        }
      ];
    }

    const events = await prisma.deliveryEvent.findMany({
      where: { deliveryId: order.delivery.id },
      orderBy: { createdAt: "asc" },
    });

    return events;
  }


  async confirmPickup(id, user) {
    return await prisma.$transaction(async (tx) => {
      const order = await orderRepository.findByIdWithRelations(id, tx);

      if (!order) {
        throw ERR.NotFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
      }

      if (order.status !== OrderStatus.READY) {
        throw ERR.BadRequest(ERROR_MESSAGES.ORDER_STATUS_INVALID);
      }

      // Check if user is a shipper
      if (user.staff?.role !== StaffRole.SHIPPER) {
        throw ERR.Forbidden(ERROR_MESSAGES.FORBIDDEN);
      }

      // Check if order is assigned to this shipper
      if (order.delivery?.shipperId !== user.staff.id) {
        throw ERR.Forbidden(ERROR_MESSAGES.ORDER_NOT_ASSIGNED_TO_SHIPPER);
      }

      // Update Order Status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.DELIVERING,
          delivery: {
            update: {
              status: DeliveryStatus.PICKED_UP,
              pickedAt: new Date(),
            }
          }
        },
        include: {
          delivery: true,
          store: true,
          customer: true,
          items: true,
        }
      });

      // Record Delivery Event
      await tx.deliveryEvent.create({
        data: {
          deliveryId: order.delivery.id,
          status: DeliveryStatus.PICKED_UP,
          note: `Đơn hàng đã được lấy bởi shipper ${user.name || user.id}`,
        }
      });

      return updatedOrder;
    });
  }

  async completeDelivery(id, user) {
    return await prisma.$transaction(async (tx) => {
      const order = await orderRepository.findByIdWithRelations(id, tx);

      if (!order) {
        throw ERR.NotFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
      }

      if (order.status !== OrderStatus.DELIVERING) {
        throw ERR.BadRequest(ERROR_MESSAGES.ORDER_STATUS_INVALID);
      }

      // Check if user is a shipper
      if (user.staff?.role !== StaffRole.SHIPPER) {
        throw ERR.Forbidden(ERROR_MESSAGES.FORBIDDEN);
      }

      if (order.delivery?.shipperId !== user.staff.id) {
        throw ERR.Forbidden(ERROR_MESSAGES.ORDER_NOT_ASSIGNED_TO_SHIPPER);
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.COMPLETED,
          delivery: {
            update: {
              status: DeliveryStatus.DELIVERED,
              deliveredAt: new Date(),
            }
          }
        },
        include: {
          delivery: true,
          store: true,
          customer: true,
          items: true,
        }
      });

      await tx.deliveryEvent.create({
        data: {
          deliveryId: order.delivery.id,
          status: DeliveryStatus.DELIVERED,
          note: `Đơn hàng đã được giao thành công bởi shipper ${user.name || user.id}`,
        }
      });

      return updatedOrder;
    });
  }

  async #buildOrderItems(items, tx) {
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await productRepository.findById(item.productId, null, tx);

      if (!product) {
        throw ERR.BadRequest(`${VALIDATION_MESSAGES.PRODUCT_NOT_FOUND} (${item.productId})`);
      }

      let optionsPrice = 0;
      const snapshotOptions = [];

      if (item.options && item.options.length > 0) {
        for (const opt of item.options) {
          // Find the option value for this specific product
          const optionValue = await tx.productOptionValue.findUnique({
            where: {
              productId_optionId: {
                productId: item.productId,
                optionId: opt.optionId
              }
            },
            include: { option: true }
          });

          if (!optionValue) {
            throw ERR.BadRequest(`Option ${opt.optionId} is not valid for product ${item.productId}`);
          }

          const price = Number(optionValue.price);
          optionsPrice += price;
          snapshotOptions.push({
            name: optionValue.option.name,
            price: price
          });
        }
      }

      const itemPrice = Number(product.basePrice);
      const itemSubtotal = (itemPrice + optionsPrice) * item.quantity;
      subtotal += itemSubtotal;

      const orderItemData = {
        productId: item.productId,
        name: product.name,
        sku: product.sku,
        price: itemPrice,
        quantity: item.quantity,
        note: item.note || null,
        tax: 0,
        discount: 0,
      };

      if (snapshotOptions.length > 0) {
        orderItemData.options = {
          create: snapshotOptions,
        };
      }

      orderItems.push(orderItemData);
    }

    return { orderItems, subtotal };
  }

  #calculateTotals(subtotal, type) {
    const serviceFee = type === OrderType.DELIVERY ? 15000 : 0;
    const tax = Number(subtotal) * 0.08; // 8% VAT
    const discount = 0;
    const total = Number(subtotal) - discount + tax + serviceFee;

    return { serviceFee, tax, discount, total };
  }

  #generateOrderCode(type) {
    const prefix = "VD";
    const typeMapping = {
      [OrderType.DELIVERY]: "DE",
      [OrderType.TAKEAWAY]: "TA",
      [OrderType.DINE_IN]: "DI",
    };
    const typeCode = typeMapping[type] || "OR";
    const timestamp = Date.now();
    return `${prefix}-${typeCode}-${timestamp}`;
  }

  async #getStaffInfoById(staffId) {
    if (!staffId) return null;

    const staff = await staffRepository.findWithUser(staffId);

    if (!staff) return null;

    return {
      id: staff.id,
      name: staff.user.email,
    };
  }

}

export const orderService = new OrderService();
