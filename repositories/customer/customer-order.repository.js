import { BaseRepository } from '../base.repository.js';

export class CustomerOrderRepository extends BaseRepository {
  constructor(prismaModel) {
    super(prismaModel);
  }

  async create(data, tx = null) {
    const client = tx || this.model;
    return await client.create({
      data,
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

  async findById(id) {
    return await this.model.findUnique({
      where: { id },
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

  async findAll({ page = 1, limit = 10, query = {}, orderBy = {} } = {}) {
    const skip = (page - 1) * limit;
    
    const [rows, count] = await Promise.all([
      this.model.findMany({
        where: query,
        skip,
        take: limit,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              address: true
            }
          },
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true
            }
          }
        }
      }),
      this.model.count({ where: query })
    ]);

    return { rows, count, page, limit };
  }
}
