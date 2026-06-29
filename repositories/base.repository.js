import { prisma } from "../lib/prisma.js";

export class BaseRepository {
  constructor(modelName) {
    this.modelName = modelName;
  }

  getModel(tx = null) {
    return tx ? tx[this.modelName] : prisma[this.modelName];
  }

  async findAll(
    {
      page = 1,
      limit = 10,
      where = {},
      include = null,
      select = null,
      orderBy = [{ createdAt: "desc" }],
    },
    tx = null,
  ) {
    const model = this.getModel(tx);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      model.findMany({
        where,
        include: select ? undefined : include,
        select,
        orderBy,
        skip,
        take: Number(limit),
      }),
      model.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      items,
      meta: {
        totalItems: total,
        currentPage: Number(page),
        pageSize: Number(limit),
        totalPages,
        hasNext: Number(page) < totalPages,
      },
    };
  }

  async findById(id, include = null, tx = null) {
    return await this.getModel(tx).findUnique({
      where: { id },
      include,
    });
  }

  async findOne(where, include = null, tx = null) {
    return await this.getModel(tx).findFirst({
      where,
      include,
    });
  }

  async create(data, tx = null) {
    return await this.getModel(tx).create({
      data,
    });
  }

  async update(id, data, tx = null) {
    return await this.getModel(tx).update({
      where: { id },
      data,
    });
  }

  async delete(id, tx = null) {
    return await this.getModel(tx).delete({
      where: { id },
    });
  }
}
