import { IStoreService } from '../../services/Interfaces/IStore.service.js';
import { ConflictException, NotFoundException } from '../../controllers/error.controller.js';

export class AdminStoreService extends IStoreService {
  constructor(prisma, storeRepo) {
    super();
    this.prisma = prisma;
    this.storeRepo = storeRepo;
  }

  async create(data) {
    const existingStore = await this.storeRepo.findByCode(data.code);
    if (existingStore) {
      throw new ConflictException("Store code already exists");
    }
    return await this.storeRepo.create(data);
  }

  async findAllAdmin(query) {
    const { page = 1, limit = 10, search, isActive } = query;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return await this.storeRepo.findAllWithPagination({
      page,
      limit,
      query: where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id) {
    const store = await this.storeRepo.findById(id);
    if (!store) {
      throw new NotFoundException("Store not found");
    }
    return store;
  }

  async update(id, data) {
    await this.findById(id);
    
    if (data.code) {
      const existingStore = await this.storeRepo.findByCode(data.code);
      if (existingStore && existingStore.id !== id) {
        throw new ConflictException("Store code already exists");
      }
    }

    return await this.storeRepo.update(id, data);
  }

  async delete(id) {
    await this.findById(id);
    return await this.storeRepo.delete(id);
  }
}
