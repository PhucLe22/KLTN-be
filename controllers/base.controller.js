import ResponseHandler from "../utils/response.handler.js";

export class BaseController {
  constructor(service) {
    this.service = service;

    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async getAll(req, res) {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

    const { rows, count } = await this.service.getAll({ page, limit });

    ResponseHandler.paginated(res, rows, page, limit, count);
  }

  async getById(req, res) {
    const record = await this.service.getById(req.params.id);

    ResponseHandler.success(res, record);
  }

  async create(req, res) {
    const record = await this.service.create(req.body);

    ResponseHandler.success(res, record, "Created successfully", 201);
  }

  async update(req, res) {
    const record = await this.service.update(req.params.id, req.body);

    ResponseHandler.success(res, record, "Updated successfully");
  }

  async delete(req, res) {
    await this.service.delete(req.params.id);

    ResponseHandler.success(res, null, "Deleted successfully");
  }
}
