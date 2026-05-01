import { BaseService } from "./base.service.js";
import { orderRepository } from "../repositories/order.repository.js";
import { customerRepository } from "../repositories/customer.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { staffRepository } from "../repositories/staff.repository.js";
import { prisma } from "../lib/prisma.js";
import { BadRequestException, NotFoundException, ForbiddenException } from "../lib/httpExceptions.js";
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from "../constants/errors.js";
import { OrderType, OrderStatus } from "../constants/enum.js";
import { OrderCreateMapper, OrderMapper } from "../mappers/order.mapper.js";
import { buildOrderFilters } from "../lib/buildOrderFilters.js";

class OrderService extends BaseService {
  constructor() {
    super(orderRepository);
    this.customerRepo = customerRepository;
    this.productRepo = productRepository;
    this.staffRepo = staffRepository;
  }

  /**
   * Unified order creation - handles 4 cases:
   * Case 1: Guest (user = null) - no auth required
   * Case 2: Customer (user exists, no staff) - use stored customer info
   * Case 3: Staff creating guest order (user.staff exists, no customerInfo)
   * Case 4: Staff creating order for existing customer? (user.staff exists, has customerInfo or null)
   */
  async createOrder(body, user = null) {
    return await prisma.$transaction(async (tx) => {
      const { storeId, type, items, note, tableNumber } = body;

      // ===== Validate =====
      await this.#validateStore(storeId, tx);
      if (!items?.length) throw new BadRequestException(VALIDATION_MESSAGES.ORDER_ITEMS_REQUIRED);

      // ===== Resolve customer & staff attribution =====
      const { customer, createdByStaffId } = this.#resolveCustomer(body, user, tx);

      if (createdByStaffId && !tableNumber) {
        throw new BadRequestException(VALIDATION_MESSAGES.TABLE_NUMBER_REQUIRED);
      }

      // ===== Build items & calculate =====
      const { orderItems, subtotal } = await this.#buildOrderItems(items, tx);
      const totals = this.#calculateTotals(subtotal, type);

      // ===== Create order =====
      const order = await this.repository.create({
        storeId,
        customerId: customer?.id ?? null,
        type,
        subtotal,
        ...totals,
        note,
        tableNumber,
        createdByStaffId,
        items: { create: orderItems },
      }, tx);

      // ===== Return order with relations & createdBy staff info =====
      const orderWithRelations = await this.repository.findByIdWithRelations(order.id, tx);
      const createdBy = await this.#getStaffInfoById(orderWithRelations.createdByStaffId);
      return { ...orderWithRelations, createdBy };
    });
  }
  async findByOrderCode(orderCode) {
    const order = await this.repository.findByOrderCode(orderCode);

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

  async getOrders(userId, query = {}) {
    return await this.repository.getOrdersByUser(userId, query);
  }

  async getOrdersForStaff(storeId, query = {}) {
    const filters = buildOrderFilters({ storeId, query });
    return await this.repository.getOrdersByFilters(filters);
  }

  async #validateStore(storeId, tx) {
    const store = await tx.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      throw new BadRequestException(VALIDATION_MESSAGES.STORE_NOT_FOUND);
    }
    return store;
  }

  async #buildOrderItems(items, tx) {
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await this.productRepo.findById(item.productId, null, tx);

      if (!product) {
        throw new BadRequestException(`${VALIDATION_MESSAGES.PRODUCT_NOT_FOUND} (${item.productId})`);
      }

      const itemPrice = Number(product.basePrice);
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;

      const orderItemData = {
        productId: item.productId,
        name: product.name,
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
    const serviceFee = type === OrderType.DELIVERY ? 15000 : 0;
    const tax = subtotal * 0.08; // 8% VAT
    const discount = 0;
    const total = subtotal - discount + tax + serviceFee;

    return { serviceFee, tax, discount, total };
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

  /**
   * Resolve customer & staff attribution for all 4 order creation cases
   * @returns {Object} { customer, createdByStaffId }
   */
  async #resolveCustomer(body, user, tx) {
    const { customerInfo } = body;
    const isStaff = user?.staff !== undefined;
    const isAuthenticated = user !== null;
    const hasCustomerInfo = customerInfo?.phone || customerInfo?.email || customerInfo?.name;

    let customer = null;
    let createdByStaffId = null;

    if (isStaff) {
      // Case 3 & 4: Staff creating order
      createdByStaffId = user.staff.id;

      if (hasCustomerInfo) {
        // Case 4: Staff creating order for existing/new customer
        customer = await this.#resolveCustomerByInfo(customerInfo, tx);
      }
      // Case 3: Staff creating guest order - customer remains null
    } else if (isAuthenticated) {
      // Case 2: Authenticated customer
      customer = await this.customerRepo.findCustomerByUserId(user.id, tx);
      if (!customer) {
        throw new BadRequestException(VALIDATION_MESSAGES.CUSTOMER_NOT_FOUND);
      }
    } else {
      // Case 1: Guest order (no authentication)
      if (hasCustomerInfo) {
        customer = await this.customerRepo.findOrCreateGuestCustomer(
          customerInfo.phone ?? null,
          customerInfo.name ?? "Guest",
          customerInfo.email ?? null,
          tx
        );
      }
    }

    return { customer, createdByStaffId };
  }

  /**
   * Find or create customer by phone/email for staff orders
   * Priority: find by phone → find by email → create new guest
   */
  async #resolveCustomerByInfo(customerInfo, tx) {
    const { phone, email, name } = customerInfo;
    let customer = null;

    if (phone) {
      customer = await this.customerRepo.findByPhone(phone, tx);
    }

    if (!customer && email) {
      const customerByEmail = await this.customerRepo.findByEmail(email, tx);
      if (customerByEmail) customer = customerByEmail;
    }

    if (!customer && (phone || email || name)) {
      customer = await this.customerRepo.findOrCreateGuestCustomer(
        phone ?? null,
        name ?? "Guest",
        email ?? null,
        tx
      );
    }

    return customer;
  }
}

export const orderService = new OrderService();
