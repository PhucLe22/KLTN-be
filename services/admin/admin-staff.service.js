import { BaseService } from '../../services/base.service.js';
import { ConflictException, NotFoundException } from '../../controllers/error.controller.js';

export class AdminStaffService extends BaseService {
  constructor(prisma, staffRepo, userRepo) {
    super();
    this.prisma = prisma;
    this.staffRepo = staffRepo;
    this.userRepo = userRepo;
  }

  async create(data) {
    const existingStaff = await this.staffRepo.findByUserId(data.userId);
    if (existingStaff) {
      throw new ConflictException("Staff already exists for this user");
    }

    const user = await this.userRepo.findById(data.userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return await this.staffRepo.create(data);
  }

  async findAll(query) {
    const { page = 1, limit = 10, storeId, role, isActive } = query;
    
    const where = {};
    if (storeId) where.storeId = storeId;
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    return await this.staffRepo.findAllWithPagination({
      page,
      limit,
      query: where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id) {
    const staff = await this.staffRepo.findById(id);
    if (!staff) {
      throw new NotFoundException("Staff not found");
    }
    return staff;
  }

  async update(id, data) {
    await this.findById(id);
    
    if (data.userId) {
      const existingStaff = await this.staffRepo.findByUserId(data.userId);
      if (existingStaff && existingStaff.id !== id) {
        throw new ConflictException("Staff already exists for this user");
      }
    }

    return await this.staffRepo.update(id, data);
  }

  async delete(id) {
    await this.findById(id);
    return await this.staffRepo.delete(id);
  }
}
