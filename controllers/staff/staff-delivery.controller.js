import { BaseController } from '../base.controller.js';

export class StaffDeliveryController extends BaseController {
  #logisticsService;

  constructor(logisticsService) {
    super();
    this.#logisticsService = logisticsService;
    this.getDeliveries = this.getDeliveries.bind(this);
    this.updateDeliveryStatus = this.updateDeliveryStatus.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
  }

  async getDeliveries(req, res, next) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const shipperId = req.user.staffId;
      const deliveries = await this.#logisticsService.findByShipper(shipperId, { status, page, limit });
      return this.ok(res, deliveries);
    } catch (error) {
      next(error);
    }
  }

  async updateDeliveryStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const shipperId = req.user.staffId;
      const delivery = await this.#logisticsService.updateDeliveryStatus(id, status, shipperId);
      return this.ok(res, delivery);
    } catch (error) {
      next(error);
    }
  }

  async updateLocation(req, res, next) {
    try {
      const { id } = req.params;
      const { lat, lng } = req.body;
      const shipperId = req.user.staffId;
      const delivery = await this.#logisticsService.updateLocation(id, { lat, lng }, shipperId);
      return this.ok(res, delivery);
    } catch (error) {
      next(error);
    }
  }
}
