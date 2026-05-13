import { BaseService } from "./base.service.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { convertToSlug } from "../lib/helpers.js";

class CategoryService extends BaseService {
    constructor() {
        super(categoryRepository);
    }

    async findAll(query) {
        return await this.repository.findAll(query);
    }
    async findBySlug(slug) {
        return await this.repository.findBySlug(slug);
    }

    async create(data) {
        // Use provided slug, generate from name only if not provided
        const categoryData = {
            ...data,
            slug: data.slug !== undefined && data.slug !== "" ? data.slug : convertToSlug(data.name)
        };
        
        return await this.repository.create(categoryData);
    }

    async update(id, data) {
        return await this.repository.update(id, data);
    }

    async delete(id) {
        return await this.repository.update(id, { isActive: false });
    }
}

export const categoryService = new CategoryService();
