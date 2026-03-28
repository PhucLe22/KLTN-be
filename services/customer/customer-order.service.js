import { IOrderService } from '../../services/Interfaces/IOrder.service.js';
import { OrderStatus } from '../../enums/order.status.enum.js';
import { NotFoundException } from '../../controllers/error.controller.js';

export class CustomerOrderService extends IOrderService {
  constructor(prisma, orderRepo) {
    super();
    this.prisma = prisma;
    this.orderRepo = orderRepo;
  }

  async create(orderData) {
    const { storeId, items, type, note, customerId } = orderData;

    // Calculate totals
    const totals = this.calculateTotals(items);

    // Create order
    const order = await this.orderRepo.create({
      storeId,
      customerId,
      type,
      status: OrderStatus.PENDING,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      serviceFee: totals.serviceFee,
      total: totals.total,
      note
    });

    return order;
  }

  calculateTotals(items) {
    const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const serviceFee = subtotal * 0.1;
    const tax = (subtotal + serviceFee) * 0.1;
    const discount = 0;
    const total = subtotal + serviceFee + tax - discount;

    return { subtotal, serviceFee, tax, discount, total };
  }

  async findAll(query) {
    const { page = 1, limit = 10, customerId, status } = query;
    
    const where = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    return await this.orderRepo.findAll({
      page,
      limit,
      query: where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id) {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new NotFoundException("Order not found");
    }
    return order;
  }
}
