import { asyncHandler } from "../lib/asyncHandler.js";
import { OK, CREATED } from "../lib/successResponse.js";

export class BaseController {
  constructor(service) {
    this.service = service;
  }

  getAll = asyncHandler(async (req, res) => {
    const { page, limit, ...filters } = req.query;

    // Result từ service trả về: { items, meta }
    const { items, meta } = await this.service.getPaginated({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      where: filters,
    });

    // Trả về kèm metadata phân trang
    return OK(res, items, meta);
  });

  getOne = asyncHandler(async (req, res) => {
    const data = await this.service.getById(req.params.id);
    return OK(res, data);
  });

  create = asyncHandler(async (req, res) => {
    const data = await this.service.create(req.body);
    return CREATED(res, data);
  });

  update = asyncHandler(async (req, res) => {
    const data = await this.service.update(req.params.id, req.body);
    return OK(res, data);
  });

  delete = asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    return res.status(204).send();
  });
}
