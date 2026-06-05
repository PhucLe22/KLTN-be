import { orderRepository } from "../repositories/order.repository.js";
import { customerRepository } from "../repositories/customer.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { staffRepository } from "../repositories/staff.repository.js";
import { prisma } from "../lib/prisma.js";
import { ERR } from "../lib/httpExceptions.js";
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from "../constants/errors.js";
import { OrderType, ROOT_USER_ID } from "../constants/enum.js";
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
        orderData.delivery = {
          create: {
            storeId,
            receiverName: deliveryInfo.receiverName,
            receiverPhone: deliveryInfo.receiverPhone,
            addressLine: deliveryInfo.addressLine,
          }
        };
      }

      const order = await orderRepository.create(orderData, tx);

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
        orderData.delivery = {
          create: {
            storeId,
            receiverName: deliveryInfo.receiverName,
            receiverPhone: deliveryInfo.receiverPhone,
            addressLine: deliveryInfo.addressLine,
          }
        };
      }

      const order = await orderRepository.create(orderData, tx);

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
    const order = await orderRepository.findById(id);

    if (!order) {
      throw ERR.NotFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    // Nếu là STAFF/MANAGER/CASHIER, chỉ được update order của store mình
    if (user.staff && order.storeId !== user.staff.storeId) {
      throw ERR.Forbidden(ERROR_MESSAGES.FORBIDDEN);
    }

    return await orderRepository.updateStatus(id, status);
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
