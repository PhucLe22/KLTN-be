import { BaseService } from "./base.service.js";
import { productRepository } from "../repositories/product.repository.js";
import { convertToSlug } from "../lib/helpers.js";

class ProductService extends BaseService {
    constructor() {
        super(productRepository);
    }

    async findAll(query) {
        return await this.repository.findAll(query);
    }

    async findBySlug(slug) {
        return await this.repository.findBySlug(slug);
    }

    async create(data) {
        const productData = { ...data };
        
        // Generate slug from name if not provided
        if (productData.name && !productData.slug) {
            productData.slug = convertToSlug(productData.name);
        }

        // Convert nested category object to categoryId for Prisma
        if (productData.category && productData.category.id) {
            productData.categoryId = productData.category.id;
            delete productData.category;
        }
        
        return await this.repository.create(productData);
    }

    async update(id, data) {
        const updateData = { ...data };
        
        // Update slug if name is changed
        if (updateData.name && !updateData.slug) {
            updateData.slug = convertToSlug(updateData.name);
        }

        // Convert nested category object to categoryId for Prisma
        if (updateData.category && updateData.category.id) {
            updateData.categoryId = updateData.category.id;
            delete updateData.category;
        }
        
        return await this.repository.update(id, updateData);
    }

    async delete(id) {
        return await this.repository.update(id, { isActive: false });
    }
}

export const productService = new ProductService();
