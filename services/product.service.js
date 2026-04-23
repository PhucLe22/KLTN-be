import { BaseService } from "./base.service.js";
import { productRepository } from "../repositories/product.repository.js";
import { NotFoundException } from "../lib/httpExceptions.js";
import { ERROR_MESSAGES } from "../constants/errors.js";

class ProductService extends BaseService {
    constructor() {
        super(productRepository);
    }

    #convertToSlug(name) {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
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

    async findBySlug(slug) {
        const product = await this.repository.findBySlug(slug);

        if (!product) {
            throw new NotFoundException(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        return product;
    }
}

export const productService = new ProductService();
