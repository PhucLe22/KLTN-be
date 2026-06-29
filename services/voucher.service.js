import { voucherRepository } from "../repositories/voucher.repository.js";
import { ERR } from "../lib/httpExceptions.js";
import { prisma } from "../lib/prisma.js";

class VoucherService  {
  async getAvailableVouchers(query) {
    const vouchers = await voucherRepository.findAvailable(query);
    
    // Filter usedCount < maxUsage in JS because Prisma doesn't support field comparison in where easily
    return vouchers.filter(v => v.maxUsage === null || v.usedCount < v.maxUsage);
  }

  async validateVoucher(code, orderAmount, storeId, customerId = null) {
    const voucher = await voucherRepository.findByCode(code);
    if (!voucher || !voucher.isActive) {
      throw ERR.BadRequest("Voucher không hợp lệ hoặc đã ngừng hoạt động.");
    }

    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      throw ERR.BadRequest("Voucher đã hết hạn.");
    }

    if (voucher.maxUsage && voucher.usedCount >= voucher.maxUsage) {
      throw ERR.BadRequest("Voucher đã hết lượt sử dụng.");
    }

    if (voucher.minOrderAmount && Number(orderAmount) < Number(voucher.minOrderAmount)) {
      throw ERR.BadRequest(`Đơn hàng tối thiểu là ${voucher.minOrderAmount}.`);
    }

    if (voucher.storeId && voucher.storeId !== storeId) {
      throw ERR.BadRequest("Voucher không áp dụng cho cửa hàng này.");
    }

    if (voucher.scope === 'CUSTOMER') {
      if (!customerId) {
        throw ERR.BadRequest("Voucher này chỉ dành cho khách hàng cụ thể.");
      }
      const customerVoucher = await prisma.customerVoucher.findUnique({
        where: {
          customerId_voucherId: {
            customerId,
            voucherId: voucher.id,
          }
        }
      });
      if (!customerVoucher) {
        throw ERR.BadRequest("Voucher không thuộc về khách hàng này.");
      }
      if (customerVoucher.isUsed) {
        throw ERR.BadRequest("Voucher đã được sử dụng.");
      }
    }

    return voucher;
  }

  async getAllPublic(query = {}) {
    const { page, limit, storeId, discountType } = query;
    const now = new Date();
    const currentPage = Number(page) || 1;
    const currentLimit = Number(limit) || 10;

    const where = {
      isActive: true,
      expiresAt: { gte: now },
    };
    if (storeId) where.storeId = storeId;
    if (discountType) where.discountType = discountType;

    const all = await voucherRepository.findAll({
      page: 1,
      limit: 999999,
      where,
      include: {
        store: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ code: "desc" }],
    });

    const filtered = all.items.filter(
      (v) => v.maxUsage === null || v.usedCount < v.maxUsage,
    );

    const skip = (currentPage - 1) * currentLimit;
    const items = filtered.slice(skip, skip + currentLimit);
    const totalItems = filtered.length;

    return {
      items,
      meta: {
        totalItems,
        currentPage,
        totalPages: Math.ceil(totalItems / currentLimit) || 1,
        hasNext: skip + currentLimit < totalItems,
      },
    };
  }

  async getAll(query = {}) {
    const { page, limit, storeId, discountType, search } = query;
    let { isActive } = query;

    const where = {};
    if (storeId) where.storeId = storeId;
    if (isActive !== undefined) where.isActive = isActive === true || isActive === "true";
    if (discountType) where.discountType = discountType;
    if (search) where.code = { contains: search, mode: "insensitive" };

    return await voucherRepository.findAll({
      page: page || 1,
      limit: limit || 100,
      where,
      include: {
        store: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ code: "desc" }],
    });
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
