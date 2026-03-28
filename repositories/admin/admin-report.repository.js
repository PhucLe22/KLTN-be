import { BaseRepository } from '../base.repository.js';

export class AdminOrderRepository extends BaseRepository {
  constructor(prismaModel) {
    super(prismaModel);
  }

  async getRevenueReport({ startDate, endDate, groupBy = 'day', storeId }) {
    const where = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      },
      ...(storeId && { storeId })
    };

    // Group by day or month based on groupBy parameter
    const dateFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';
    
    const results = await this.model.groupBy({
      by: ['createdAt'],
      where,
      _sum: {
        total: true
      },
      _count: {
        id: true
      }
    });

    return results;
  }

  async getTopProducts({ startDate, endDate, storeId, limit = 10 }) {
    const where = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      },
      ...(storeId && { storeId })
    };

    const items = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: where
      },
      _sum: {
        quantity: true,
        price: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: limit
    });

    return items;
  }
}
