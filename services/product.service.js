import { BaseService } from "./base.service.js";
import { productRepository } from "../repositories/product.repository.js";

class ProductService extends BaseService {
    constructor() {
        super();
    }

    async findAll() {
        return await productRepository.findAll();
    }
}

export const productService = new ProductService();
