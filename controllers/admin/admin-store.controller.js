import { BaseController } from '../base.controller.js';
import { createStoreDto, updateStoreDto, storeQueryAdminDto } from '../../DTOs/store.dto.js';

export class AdminStoreController extends BaseController {
  #storeService;

  constructor(storeService) {
    super();
    this.#storeService = storeService;
    this.createStore = this.createStore.bind(this);
    this.getAllStores = this.getAllStores.bind(this);
    this.getStoreById = this.getStoreById.bind(this);
    this.updateStore = this.updateStore.bind(this);
    this.deleteStore = this.deleteStore.bind(this);
  }

  async createStore(req, res, next) {
    try {
      const validatedData = createStoreDto.parse(req.body);
      const store = await this.#storeService.create(validatedData);
      return this.created(res, store);
    } catch (error) {
      next(error);
    }
  }

  async getAllStores(req, res, next) {
    try {
      const validatedQuery = storeQueryAdminDto.parse(req.query);
      const result = await this.#storeService.findAllAdmin(validatedQuery);
      return this.ok(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getStoreById(req, res, next) {
    try {
      const { id } = req.params;
      const store = await this.#storeService.findById(id);
      return this.ok(res, store);
    } catch (error) {
      next(error);
    }
  }

  async updateStore(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = updateStoreDto.parse(req.body);
      const store = await this.#storeService.update(id, validatedData);
      return this.ok(res, store);
    } catch (error) {
      next(error);
    }
  }

  async deleteStore(req, res, next) {
    try {
      const { id } = req.params;
      await this.#storeService.delete(id);
      return this.noContent(res);
    } catch (error) {
      next(error);
    }
  }
}
