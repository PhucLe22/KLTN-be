import { IOrderService } from '../../services/Interfaces/IOrder.service.js';
import { OrderStatus } from '../../enums/order.status.enum.js';
import { NotFoundException } from '../../controllers/error.controller.js';

export class StaffOrderService extends IOrderService {
  constructor(prisma, orderRepo) {
    super();
    this.prisma = prisma;
    this.orderRepo = orderRepo;
  }

  async create(orderData) {
    const { storeId, items, type, note, createdByStaffId } = orderData;

    // Generate order code
    const orderCode = await this.orderRepo.generateOrderCode(storeId);

    // Calculate totals
    const totals = this.calculateTotals(items);

    // Create order with items
    const order = await this.orderRepo.createWithItems({
      storeId,
      type,
      status: OrderStatus.PENDING,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      serviceFee: totals.serviceFee,
      total: totals.total,
      note,
      code: orderCode,
      createdByStaffId
    }, items);

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

  async updateStatus(id, status, staffId) {
    return await this.orderRepo.updateStatus(id, status, staffId);
  }
}
