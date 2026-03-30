import { prisma } from "../lib/prisma.js";

export class BaseRepository {
  constructor(modelName) {
    this.model = prisma[modelName];
    this.modelName = modelName;
  }

  async findAll(params = {}) {
    return await this.model.findMany(params);
  }

  async findById(id, include = null) {
    return await this.model.findUnique({
      where: { id },
      include,
    });
  }

  async findOne(where, include = null) {
    return await this.model.findFirst({
      where,
      include,
    });
  }

  async create(data) {
    return await this.model.create({
      data,
    });
  }

  async update(id, data) {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return await this.model.delete({
      where: { id },
    });
  }

  // Hỗ trợ phân trang (Pagination) mặc định
  async paginate({
    page = 1,
    limit = 10,
    where = {},
    include = null,
    orderBy = { createdAt: "desc" },
  }) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.model.findMany({
        where,
        include,
        orderBy,
        skip,
        take: Number(limit),
      }),
      this.model.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
