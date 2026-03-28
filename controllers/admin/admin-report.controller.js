import { BaseController } from '../base.controller.js';

export class AdminReportController extends BaseController {
  #reportService;

  constructor(reportService) {
    super();
    this.#reportService = reportService;
    this.getRevenueReport = this.getRevenueReport.bind(this);
    this.getTopProducts = this.getTopProducts.bind(this);
  }

  async getRevenueReport(req, res, next) {
    try {
      const { startDate, endDate, groupBy = 'day', storeId } = req.query;
      const report = await this.#reportService.getRevenueReport({ startDate, endDate, groupBy, storeId });
      return this.ok(res, report);
    } catch (error) {
      next(error);
    }
  }

  async getTopProducts(req, res, next) {
    try {
      const { startDate, endDate, storeId, limit = 10 } = req.query;
      const topProducts = await this.#reportService.getTopProducts({ startDate, endDate, storeId, limit });
      return this.ok(res, topProducts);
    } catch (error) {
      next(error);
    }
  }
}
