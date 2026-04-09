const MODEL_NAME = "product";
import { BaseRepository } from "./base.repository.js";

class ProductRepository extends BaseRepository {
    constructor() {
        super(MODEL_NAME);
    }
}

export const productRepository = new ProductRepository();