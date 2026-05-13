import { BaseService } from "./base.service.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { convertToSlug } from "../lib/helpers.js";

class CategoryService extends BaseService {
    constructor() {
        super(categoryRepository);
    }

    async findAll(query) {
        const { page = 1, limit = 10, search, sortBy = "sortOrder", sortOrder = "asc", isActive = "true" } = query;
        
        const where = {};
        
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } }
            ];
        }
        
        if (isActive !== undefined) {
            where.isActive = isActive === "true";
        }

        const select = {
            id: true,
            name: true,
            slug: true,
            sortOrder: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        };

        return await this.repository.findAll({
            page,
            limit,
            where,
            select,
            orderBy: { [sortBy]: sortOrder }
        });
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
