import { BaseService } from '../base.service.js';

export class AdminReportService extends BaseService {
  constructor(prisma, orderRepo, productRepo) {
    super();
    this.prisma = prisma;
    this.orderRepo = orderRepo;
    this.productRepo = productRepo;
  }

  async getRevenueReport({ startDate, endDate, groupBy = 'day', storeId }) {
    return await this.orderRepo.getRevenueReport({ startDate, endDate, groupBy, storeId });
  }

  async getTopProducts({ startDate, endDate, storeId, limit = 10 }) {
    return await this.orderRepo.getTopProducts({ startDate, endDate, storeId, limit });
  }
}
