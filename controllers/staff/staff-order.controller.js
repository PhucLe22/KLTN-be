import { BaseController } from '../base.controller.js';
import { createOrderDto } from '../../DTOs/order.dto.js';

export class StaffOrderController extends BaseController {
  #orderService;

  constructor(orderService) {
    super();
    this.#orderService = orderService;
    this.createOrder = this.createOrder.bind(this);
    this.updateOrderStatus = this.updateOrderStatus.bind(this);
  }

  async createOrder(req, res, next) {
    try {
      const validatedData = createOrderDto.parse(req.body);
      // Add staff ID from authenticated user
      const orderData = {
        ...validatedData,
        createdByStaffId: req.user.staffId
      };
      const order = await this.#orderService.create(orderData);
      
      // Format response according to requirements
      const response = {
        store: {
          name: order.store.name,
          address: order.store.address
        },
        customer: order.customer ? {
          name: order.customer.name,
          phone: order.customer.phone,
          address: order.customer.address || ''
        } : undefined,
        status: order.status,
        type: order.type,
        subtotal: order.subtotal,
        serviceFee: order.serviceFee,
        tax: order.tax,
        discount: order.discount,
        total: order.total,
        note: order.note,
        createdBy: order.createdByStaff ? {
          name: order.createdByStaff.user?.email
        } : undefined,
        createdAt: order.createdAt,
        orderCode: order.code
      };
      
      return this.created(res, response);
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await this.#orderService.updateStatus(id, status, req.user.staffId);
      return this.ok(res, order);
    } catch (error) {
      next(error);
    }
  }
}
