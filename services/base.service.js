export class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAll({ page = 1, limit = 10, query = {}, orderBy = {} } = {}) {
    return await this.repository.findAll({ page, limit, query, orderBy });
  }

  async getById(id) {
    const record = await this.repository.findById(id);
    
    if (!record) {
      throw new Error('Record not found');
    }
    
    return record;
  }

  async create(data) {
    return await this.repository.create(data);
  }

  async update(id, data) {
    try {
      return await this.repository.update(id, data);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Record not found');
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.repository.delete(id);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Record not found');
      }
      throw error;
    }
  }

  async findOne(query) {
    return await this.repository.findOne(query);
  }

  async findMany(query) {
    return await this.repository.findMany(query);
  }
}
