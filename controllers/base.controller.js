export class BaseController {
  constructor(service) {
    this.service = service;
  }

  getAll = async (req, res, next) => {
    try {
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

      const { rows, count } = await this.service.getAll({ page, limit });

      return res.status(200).json({
        success: true,
        data: rows,
        meta: {
          page,
          limit,
          total: count,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const record = await this.service.getById(req.params.id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Record not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const record = await this.service.create(req.body);

      return res.status(201).json({
        success: true,
        message: "Created successfully",
        data: record,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const record = await this.service.update(req.params.id, req.body);

      return res.status(200).json({
        success: true,
        message: "Updated successfully",
        data: record,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.service.delete(req.params.id);
      
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}