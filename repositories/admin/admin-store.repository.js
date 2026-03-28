import { BaseRepository } from '../base.repository.js';

export class AdminStoreRepository extends BaseRepository {
  constructor(prismaModel) {
    super(prismaModel);
  }

  async findByCode(code) {
    return await this.model.findFirst({
      where: { code }
    });
  }

  async findAllWithPagination({ page = 1, limit = 10, query = {}, orderBy = {} } = {}) {
    const skip = (page - 1) * limit;
    
    const [rows, count] = await Promise.all([
      this.model.findMany({
        where: query,
        skip,
        take: limit,
        orderBy: orderBy || { createdAt: 'desc' }
      }),
      this.model.count({ where: query })
    ]);

    return { rows, count, page, limit };
  }
}
