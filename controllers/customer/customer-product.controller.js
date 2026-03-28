import { BaseController } from '../base.controller.js';
import { productQueryDto } from '../../DTOs/product.dto.js';
import { storeQueryDto } from '../../DTOs/store.dto.js';

export class CustomerProductController extends BaseController {
  #productService;
  #storeService;

  constructor(productService, storeService) {
    super();
    this.#productService = productService;
    this.#storeService = storeService;
    this.getProducts = this.getProducts.bind(this);
    this.getNearbyStores = this.getNearbyStores.bind(this);
  }

  async getProducts(req, res, next) {
    try {
      const validatedQuery = productQueryDto.parse(req.query);
      const result = await this.#productService.findAll(validatedQuery);
      
      // Format response according to requirements
      const response = result.rows.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        thumbnail: product.thumbnail
      }));

      return this.ok(res, response);
    } catch (error) {
      next(error);
    }
  }

  async getNearbyStores(req, res, next) {
    try {
      const validatedQuery = storeQueryDto.parse(req.query);
      const result = await this.#storeService.findAll(validatedQuery);
      
      // Format response according to requirements
      const response = result.rows.map(store => ({
        id: store.id,
        name: store.name,
        address: store.address,
        lat: store.lat,
        lng: store.lng,
        hotline: store.hotline,
        isActive: store.isActive,
        distance: store.distance
      }));

      return this.ok(res, response);
    } catch (error) {
      next(error);
    }
  }
}
