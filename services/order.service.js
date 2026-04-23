import { BaseService } from "./base.service.js";
import { orderRepository } from "../repositories/order.repository.js";
import { customerRepository } from "../repositories/customer.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { staffRepository } from "../repositories/staff.repository.js";
import { prisma } from "../lib/prisma.js";
import { BadRequestException, NotFoundException, ForbiddenException } from "../lib/httpExceptions.js";
import { ERROR_MESSAGES } from "../constants/errors.js";

class OrderService extends BaseService {
  constructor() {
    super(orderRepository);
    this.customerRepo = customerRepository;
    this.productRepo = productRepository;
    this.staffRepo = staffRepository;
  }

  async create(data, staffId = null, userId = null) {
    return await prisma.$transaction(async (tx) => {
      const { storeId, type, customerInfo, items, note, deliveryInfo } = data;

      const store = await this.#validateStore(storeId, tx);
      const customer = await this.#handleCustomerCreation(userId, customerInfo, tx);
      const { orderItems, subtotal } = await this.#buildOrderItems(items, tx);
      const { serviceFee, tax, discount, total } = this.#calculateTotals(
        subtotal,
        type,
      );
      // const orderCode = this.#generateOrderCode(store.code);
      const createdBy = await this.#getStaffInfo(staffId, tx);

      const order = await this.repository.create(
        {
          storeId,
          customerId: customer?.id || null,
          type,
          status: "NEW",
          subtotal,
          discount,
          tax,
          serviceFee,
          total,
          note: note || null,
          createdByStaffId: staffId || null,
          items: {
            create: orderItems,
          },
        },
        tx,
      );

      const orderWithRelations = await tx.order.findUnique({
        where: { id: order.id },
        include: {
          store: true,
          customer: true,
        },
      });

      return {
        ...orderWithRelations,
        // orderCode,
        createdBy,
      };
    });
  }

  async #handleCustomerCreation(userId, customerInfo, tx) {
    // Check bearer token first - if authenticated, use account
    if (userId) {
      // Order with account - customer has user_id saved
      return await this.customerRepo.findCustomerByUserId(userId, tx);
    }
    
    // Order without account - require phone and name
    if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
      throw new BadRequestException("Name and phone are required for orders without account");
    }
    
    return await this.customerRepo.findOrCreateGuestCustomer(
      customerInfo.phone,
      customerInfo.name,
      tx
    );
  }

  async findByOrderCode(orderCode) {
    const order = await this.repository.findByOrderCode(orderCode);

    // if (!order) {
    //   throw new NotFoundException(ERROR_MESSAGES.ORDER_NOT_FOUND);
    // }

    // Get staff info for createdBy
    const createdBy = await this.#getStaffInfoById(order.createdByStaffId);

    return {
      ...order,
      createdBy,
    };
  }

  async getOrderHistory(userId, query) {
    const customer = await this.customerRepo.findCustomerByUserId(userId);
    if (!customer) {
      throw new NotFoundException("Không tìm thấy thông tin khách hàng");
    }
    return await this.repository.findOrdersByCustomerId(customer.id, query);
  }

  async getOrderById(id) {
    const order = await this.repository.findById(id, {
      store: true,
      customer: true,
      items: true,
    });

    if (!order) {
      throw new NotFoundException(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    // Get staff info for createdBy
    const createdBy = await this.#getStaffInfoById(order.createdByStaffId);

    return {
      ...order,
      createdBy,
    };
  }

  async #validateStore(storeId, tx) {
    const store = await tx.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      throw new BadRequestException("Cửa hàng không tồn tại");
    }
    return store;
  }

  async #getCustomer(customerId, tx) {
    if (!customerId) return null;
    return await this.customerRepo.findById(customerId, null, tx);
  }

  async #buildOrderItems(items, tx) {
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await this.productRepo.findById(item.productId, null, tx);

      if (!product) {
        throw new BadRequestException(`Sản phẩm ${item.productId} không tồn tại`);
      }

      const itemPrice = Number(product.basePrice);
      const itemSubtotal = itemPrice * item.quantity;
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

      if (item.options && item.options.length > 0) {
        orderItemData.options = {
          create: item.options.map((opt) => ({
            name: opt.name,
            price: opt.price,
          })),
        };
      }

      orderItems.push(orderItemData);
    }

    return { orderItems, subtotal };
  }

  #calculateTotals(subtotal, type) {
    const serviceFee = type === "DELIVERY" ? 15000 : 0;
    const tax = subtotal * 0.08; // 8% VAT
    const discount = 0;
    const total = subtotal - discount + tax + serviceFee;

    return { serviceFee, tax, discount, total };
  }

  async #getStaffInfo(staffId, tx) {
    if (!staffId) return null;

    const staff = await this.staffRepo.findWithUser(staffId, tx);

    if (!staff) return null;

    return {
      id: staff.id,
      name: staff.user.email,
    };
  }

  async #getStaffInfoById(staffId) {
    if (!staffId) return null;

    const staff = await this.staffRepo.findWithUser(staffId);

    if (!staff) return null;

    return {
      id: staff.id,
      name: staff.user.email,
    };
  }

  #generateOrderCode(storeCode) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `${storeCode}-${dateStr}-${random}`;
  }
}

export const orderService = new OrderService();
