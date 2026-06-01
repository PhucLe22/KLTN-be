import { BaseRepository } from "./base.repository.js";

class VoucherRepository extends BaseRepository {
  constructor() {
    super("voucher");
  }

  async findAvailable(query = {}, tx = null) {
    const { storeId, orderAmount } = query;
    const now = new Date();

    const where = {
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } }
      ],
      // usedCount < maxUsage (if maxUsage is set)
      // This is hard to do in a single where if maxUsage is null
    };

    if (storeId) {
      where.OR = where.OR || [];
      where.OR.push(
        { storeId: null },
        { storeId: storeId }
      );
    }

    if (orderAmount) {
      where.OR = where.OR || [];
      where.OR.push(
        { minOrderAmount: null },
        { minOrderAmount: { lte: orderAmount } }
      );
    }

    // Prisma doesn't support comparing two columns in 'where' directly easily without $where or raw SQL for usedCount < maxUsage
    // But we can filter in JS if the list is small, or use a better query.
    
    return await this.getModel(tx).findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
  }
}

export const voucherRepository = new VoucherRepository();
