import { BaseService } from '../base.service.js';

export class CustomerProductService extends BaseService {
  constructor(prisma, productRepo) {
    super();
    this.prisma = prisma;
    this.productRepo = productRepo;
  }

  async findAll(query) {
    const { page = 1, limit = 10, category, search } = query;
    return await this.productRepo.findAll({
      page,
      limit,
      category,
      search
    });
  }
}
