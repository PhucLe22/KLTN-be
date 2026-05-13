import { BaseService } from "./base.service.js";
import { productRepository } from "../repositories/product.repository.js";
import { convertToSlug } from "../lib/helpers.js";

class ProductService extends BaseService {
    constructor() {
        super(productRepository);
    }

    async findAll(query) {
        const { page = 1, limit = 10, categoryId, search, sortBy = "createdAt", sortOrder = "desc", type, isActive = "true" } = query;
        
        const where = {};
        
        if (categoryId) {
            where.categoryId = categoryId;
        }
        
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } }
            ];
        }
        
        if (type) {
            where.type = type;
        }
        
        if (isActive !== undefined) {
            where.isActive = isActive === "true";
        }

        const select = {
            id: true,
            sku: true,
            name: true,
            description: true,
            type: true,
            basePrice: true,
            costPrice: true,
            taxRate: true,
            thumbnail: true,
            images: true,
            categoryId: true,
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true
                }
            },
            sortOrder: true,
            preparationTime: true,
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

    async create(data) {
        // Convert nested category object to categoryId for Prisma
        const productData = { ...data };
        if (productData.category && productData.category.id) {
            productData.categoryId = productData.category.id;
            delete productData.category;
        }
        
        return await this.repository.create(productData);
    }

    async update(id, data) {
        // Convert nested category object to categoryId for Prisma
        const updateData = { ...data };
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
