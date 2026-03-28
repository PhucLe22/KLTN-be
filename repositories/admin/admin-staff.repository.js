import { BaseRepository } from '../base.repository.js';

export class AdminStaffRepository extends BaseRepository {
  constructor(prismaModel) {
    super(prismaModel);
  }

  async findByUserId(userId) {
    return await this.model.findFirst({
      where: { userId },
      include: {
        user: true,
        store: true
      }
    });
  }

  async findAllWithPagination({ page = 1, limit = 10, query = {}, orderBy = {} } = {}) {
    const skip = (page - 1) * limit;
    
    const [rows, count] = await Promise.all([
      this.model.findMany({
        where: query,
        skip,
        take: limit,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              phone: true
            }
          },
          store: {
            select: {
              name: true,
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
