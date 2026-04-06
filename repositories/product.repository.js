import { BaseRepository } from "./base.repository.js";

class ProductRepository extends BaseRepository {
    constructor() {
        super("product");
    }

    async findAll() {
        return await this.getModel().findMany();
    }
}

export const productRepository = new ProductRepository();