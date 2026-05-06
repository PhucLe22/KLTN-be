import { BaseService } from "./base.service.js";
import { orderRepository } from "../repositories/order.repository.js";
import { customerRepository } from "../repositories/customer.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { staffRepository } from "../repositories/staff.repository.js";
import { prisma } from "../lib/prisma.js";
import { BadRequestException, NotFoundException, ForbiddenException } from "../lib/httpExceptions.js";
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from "../constants/errors.js";
import { OrderType, ROOT_USER_ID } from "../constants/enum.js";
import { buildOrderFilters } from "../lib/buildOrderFilters.js";

class OrderService extends BaseService {
  constructor() {
    super(orderRepository);
    this.customerRepo = customerRepository;
    this.productRepo = productRepository;
    this.staffRepo = staffRepository;
  }

  // Customer (Auth) 
  // Staff (Auth) create order for Guest (user_id?)/ Customer

  // body
  // findByNameOrPhone
  // If true return createOrder 
  // else return error (add enum for error message)

  async createOrder(body, user) {
    console.log("Test user", user);
    return await prisma.$transaction(async (tx) => {
      const { storeId, type, items, note} = body;
      
      const { orderItems, subtotal } = await this.#buildOrderItems(items, tx);
      const totals = this.#calculateTotals(subtotal, type);

      const customer = await this.customerRepo.findCustomerByUserId(user.id, tx);
      const customerId = customer.id;

      const order = await this.repository.create({
        storeId,
        type,
        subtotal,
        ...totals,
        note,
        customerId,
        items: { create: orderItems },
        createdBy: ROOT_USER_ID,
      }, tx);

      return await this.repository.findByIdWithRelations(order.id, tx);
    });
  }

  async createOrderForStaff(storeId, body, user) {
    return await prisma.$transaction(async (tx) => {
      const { type, items, note, tableNumber, phone } = body;
      
      const { orderItems, subtotal } = await this.#buildOrderItems(items, tx);
      const totals = this.#calculateTotals(subtotal, type);

      const customer = await this.customerRepo.findByPhone(phone, tx);
      const customerId = customer.id;

      const order = await this.repository.create({
        storeId,
        type,
        subtotal,
        ...totals,
        note,
        tableNumber,
        customerId,
        items: { create: orderItems },
        createdBy: user?.id,
      }, tx);

      return await this.repository.findByIdWithRelations(order.id, tx);
    });
  }

  async findByOrderCode(orderCode) {
    const order = await this.repository.findByOrderCode(orderCode);

    if (!order) {
      throw new NotFoundException(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    // Get staff info for createdBy
    const createdBy = await this.#getStaffInfoById(order.createdBy);

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
}

export const orderService = new OrderService();
