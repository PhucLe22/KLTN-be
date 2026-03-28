import { BaseRepository } from '../base.repository.js';

export class StaffProductRepository extends BaseRepository {
  constructor(prismaModel) {
    super(prismaModel);
  }

  async updateStock(id, inStock) {
    return await this.model.update({
      where: { id },
      data: { inStock, updatedAt: new Date() }
    });
  }

  async findByIdWithDetails(id) {
    return await this.model.findUnique({
      where: { id },
      include: {
        category: true
      }
    });
  }
}
