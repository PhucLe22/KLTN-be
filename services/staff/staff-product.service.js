import { BaseService } from '../base.service.js';
import { NotFoundException } from '../../controllers/error.controller.js';

export class StaffProductService extends BaseService {
  constructor(prisma, productRepo) {
    super();
    this.prisma = prisma;
    this.productRepo = productRepo;
  }

  async updateStock(id, inStock) {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return await this.productRepo.updateStock(id, inStock);
  }

  async findById(id) {
    const product = await this.productRepo.findByIdWithDetails(id);
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return product;
  }
}
