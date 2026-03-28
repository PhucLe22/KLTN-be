export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll({ page = 1, limit = 10, query = {}, orderBy = {} } = {}) {
    const skip = (page - 1) * limit;
    
    const [rows, count] = await Promise.all([
      this.model.findMany({
        where: query,
        skip,
        take: limit,
        orderBy
      }),
      this.model.count({ where: query })
    ]);

    return { rows, count, page, limit };
  }

  async findById(id) {
    return await this.model.findUnique({
      where: { id }
    });
  }

  async findOne(query) {
    const options = query.where ? query : { where: query };
    return await this.model.findFirst(options);
  }

  async create(data) {
    return await this.model.create({
      data
    });
  }

  async update(id, data) {
    return await this.model.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    await this.model.delete({
      where: { id }
    });
    return 1;
  }

  async findMany(query) {
    return await this.model.findMany({
      where: query
    });
  }
}