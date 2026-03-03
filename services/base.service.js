import { NotFoundException } from "../controllers/error.controller.js";

export class BaseService {
  constructor(repository, entityName = "Resource") {
    this.repository = repository;
    this.entityName = entityName;
  }

  async getAll(options = {}) {
    return this.repository.findAll(options);
  }

  async getById(id, options = {}) {
    const record = await this.repository.findById(id, options);
    if (!record) throw new NotFoundException(`${this.entityName} not found`);
    return record;
  }

  async create(data) {
    return this.repository.create(data);
  }

  async update(id, data) {
    await this.getById(id);
    const [, [updated]] = await this.repository.update(id, data);
    return updated;
  }

  async delete(id) {
    await this.getById(id);
    await this.repository.delete(id);
  }
}
