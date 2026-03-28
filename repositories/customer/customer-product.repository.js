import { BaseRepository } from '../base.repository.js';

export class CustomerProductRepository extends BaseRepository {
  constructor(prismaModel) {
    super(prismaModel);
  }

  async findAll({ page = 1, limit = 10, category, search } = {}) {
    const skip = (page - 1) * limit;
    
    const where = {
      isActive: true,
      ...(category && { categoryId: category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [rows, count] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          thumbnail: true
        },
        orderBy: { name: 'asc' }
      }),
      this.model.count({ where })
    ]);

    return { rows, count, page, limit };
  }
}
