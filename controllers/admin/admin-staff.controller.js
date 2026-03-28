import { BaseController } from '../base.controller.js';
import { createStaffDto, updateStaffDto, staffQueryDto } from '../../DTOs/staff.dto.js';

export class AdminStaffController extends BaseController {
  #authService;
  #staffService;

  constructor(authService, staffService) {
    super();
    this.#authService = authService;
    this.#staffService = staffService;
    this.createStaff = this.createStaff.bind(this);
    this.getAllStaffs = this.getAllStaffs.bind(this);
    this.getStaffById = this.getStaffById.bind(this);
    this.updateStaff = this.updateStaff.bind(this);
    this.deleteStaff = this.deleteStaff.bind(this);
  }

  async createStaff(req, res, next) {
    try {
      const validatedData = createStaffDto.parse(req.body);
      const staff = await this.#staffService.create(validatedData);
      return this.created(res, staff);
    } catch (error) {
      next(error);
    }
  }

  async getAllStaffs(req, res, next) {
    try {
      const validatedQuery = staffQueryDto.parse(req.query);
      const result = await this.#staffService.findAll(validatedQuery);
      return this.ok(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getStaffById(req, res, next) {
    try {
      const { id } = req.params;
      const staff = await this.#staffService.findById(id);
      return this.ok(res, staff);
    } catch (error) {
      next(error);
    }
  }

  async updateStaff(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = updateStaffDto.parse(req.body);
      const staff = await this.#staffService.update(id, validatedData);
      return this.ok(res, staff);
    } catch (error) {
      next(error);
    }
  }

  async deleteStaff(req, res, next) {
    try {
      const { id } = req.params;
      await this.#staffService.delete(id);
      return this.noContent(res);
    } catch (error) {
      next(error);
    }
  }
}
