export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll({ page = 1, limit = 10, where = {}, include, order, attributes } = {}) {
    const offset = (page - 1) * limit;

    return this.model.findAndCountAll({
      where,
      limit,
      offset,
      ...(include && { include }),
      ...(order && { order }),
      ...(attributes && { attributes }),
    });
  }

  async findById(id, { include, attributes } = {}) {
    return this.model.findByPk(id, {
      ...(include && { include }),
      ...(attributes && { attributes }),
    });
  }

  async findOne(where, { include, attributes } = {}) {
    return this.model.findOne({
      where,
      ...(include && { include }),
      ...(attributes && { attributes }),
    });
  }

  async create(data) {
    return this.model.create(data);
  }

  async update(id, data) {
    return this.model.update(data, { where: { id }, returning: true });
  }

  async delete(id) {
    return this.model.destroy({ where: { id } });
  }
}
