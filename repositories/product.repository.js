import { BaseRepository } from "./base.repository.js";

class ProductRepository extends BaseRepository {
    constructor() {
        super("product");
    }
}

export const productRepository = new ProductRepository();