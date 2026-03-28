import { BaseController } from '../base.controller.js';
import { createOrderDto, orderQueryDto } from '../../DTOs/order.dto.js';

export class CustomerOrderController extends BaseController {
  #orderService;

  constructor(orderService) {
    super();
    this.#orderService = orderService;
    this.createOrder = this.createOrder.bind(this);
    this.getOrderHistory = this.getOrderHistory.bind(this);
    this.getOrderById = this.getOrderById.bind(this);
  }

  async createOrder(req, res, next) {
    try {
      const validatedData = createOrderDto.parse(req.body);
      const order = await this.#orderService.create(validatedData);
      
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

  async getOrderHistory(req, res, next) {
    try {
      const validatedQuery = orderQueryDto.parse(req.query);
      const result = await this.#orderService.findAll(validatedQuery);
      
      // Format response: [ orders { orderCode, total, address, updatedAt, status }]
      const response = result.rows.map(order => ({
        orderCode: order.code,
        total: order.total,
        address: order.delivery?.deliveryAddress || order.store?.address || '',
        updatedAt: order.updatedAt,
        status: order.status
      }));

      return this.ok(res, response);
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await this.#orderService.findById(id);
      
      // Format response with order details
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
        orderCode: order.code,
        orderItems: order.items?.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          discount: 0,
          tax: 0,
          note: ''
        })) || []
      };

      return this.ok(res, response);
    } catch (error) {
      next(error);
    }
  }
}
