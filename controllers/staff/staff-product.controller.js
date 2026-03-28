import { BaseController } from '../base.controller.js';

export class StaffProductController extends BaseController {
  #productService;

  constructor(productService) {
    super();
    this.#productService = productService;
    this.updateStock = this.updateStock.bind(this);
    this.checkAvailability = this.checkAvailability.bind(this);
  }

  async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      const { inStock } = req.body;
      const product = await this.#productService.updateStock(id, inStock);
      return this.ok(res, product);
    } catch (error) {
      next(error);
    }
  }

  async checkAvailability(req, res, next) {
    try {
      const { id } = req.params;
      const product = await this.#productService.findById(id);
      return this.ok(res, {
        id: product.id,
        name: product.name,
        inStock: product.inStock,
        available: product.inStock
      });
    } catch (error) {
      next(error);
    }
  }
}
