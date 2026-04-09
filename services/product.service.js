import { BaseService } from "./base.service.js";
import { productRepository } from "../repositories/product.repository.js";

class ProductService extends BaseService {
    constructor() {
        super(productRepository);
    }

    async findAll(query) {
        const { page = 1, limit = 10, search } = query;
        
        const where = {};
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }
        
        return await this.repository.findAll({
            page,
            limit,
            where,
            select: {
                id: true,
                name: true,
                description: true,
                basePrice: true,
                thumbnail: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}

export const productService = new ProductService();
