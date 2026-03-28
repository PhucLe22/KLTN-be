import { BaseRepository } from '../base.repository.js';

export class StaffOrderRepository extends BaseRepository {
  constructor(prismaModel) {
    super(prismaModel);
  }

  async createWithItems(orderData, items, tx = null) {
    const client = tx || this.model;
    return await client.create({
      data: {
        ...orderData,
        items: {
          create: items
        }
      },
      include: {
        store: true,
        customer: true,
        items: {
          include: {
            options: true,
            product: true
          }
        }
      }
    });
  }

  async generateOrderCode(storeId) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const todayOrders = await this.model.count({
      where: {
        storeId,
        createdAt: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lt: new Date(today.setHours(23, 59, 59, 999))
        }
      }
    });

    const sequence = String(todayOrders + 1).padStart(3, '0');
    return `ORD${dateStr}${sequence}`;
  }

  async updateStatus(id, status, staffId) {
    return await this.model.update({
      where: { id },
      data: {
        status,
        updatedByStaffId: staffId,
        updatedAt: new Date()
      }
    });
  }
}
