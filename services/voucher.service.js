import { voucherRepository } from "../repositories/voucher.repository.js";

class VoucherService  {
  async getAvailableVouchers(query) {
    const vouchers = await voucherRepository.findAvailable(query);
    
    // Filter usedCount < maxUsage in JS because Prisma doesn't support field comparison in where easily
    return vouchers.filter(v => v.maxUsage === null || v.usedCount < v.maxUsage);
  }

  async createVoucher(data) {
    return await voucherRepository.create(data);
  }

  async updateVoucher(id, data) {
    return await voucherRepository.update(id, data);
  }

  async deleteVoucher(id) {
    return await voucherRepository.delete(id);
  }
}

export const voucherService = new VoucherService();
