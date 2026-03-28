import { BaseService } from '../base.service.js';
import { NotFoundException } from '../../controllers/error.controller.js';

export class StaffDeliveryService extends BaseService {
  constructor(prisma, logisticsRepo) {
    super();
    this.prisma = prisma;
    this.logisticsRepo = logisticsRepo;
  }

  async findByShipper(shipperId, { status, page = 1, limit = 10 }) {
    return await this.logisticsRepo.findByShipper(shipperId, { status, page, limit });
  }

  async updateDeliveryStatus(id, status, shipperId) {
    const delivery = await this.logisticsRepo.findById(id);
    if (!delivery) {
      throw new NotFoundException("Delivery not found");
    }
    if (delivery.shipperId !== shipperId) {
      throw new NotFoundException("Unauthorized to update this delivery");
    }
    return await this.logisticsRepo.updateStatus(id, status);
  }

  async updateLocation(id, { lat, lng }, shipperId) {
    const delivery = await this.logisticsRepo.findById(id);
    if (!delivery) {
      throw new NotFoundException("Delivery not found");
    }
    if (delivery.shipperId !== shipperId) {
      throw new NotFoundException("Unauthorized to update this delivery");
    }
    return await this.logisticsRepo.updateLocation(id, { lat, lng });
  }
}
