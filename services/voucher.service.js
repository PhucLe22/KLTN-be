import { BaseService } from "./base.service.js";
import { voucherRepository } from "../repositories/voucher.repository.js";

class VoucherService extends BaseService {
  constructor() {
    super(voucherRepository);
  }

  async getAvailableVouchers(query) {
    const vouchers = await this.repository.findAvailable(query);
    
    // Filter usedCount < maxUsage in JS because Prisma doesn't support field comparison in where easily
    return vouchers.filter(v => v.maxUsage === null || v.usedCount < v.maxUsage);
  }

  async createVoucher(data) {
    return await this.repository.create(data);
  }

  async updateVoucher(id, data) {
    return await this.repository.update(id, data);
  }

  async deleteVoucher(id) {
    return await this.repository.delete(id);
  }
}

export const voucherService = new VoucherService();
