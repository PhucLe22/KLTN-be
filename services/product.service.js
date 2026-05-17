import { BaseService } from "./base.service.js";
import { productRepository } from "../repositories/product.repository.js";
import { convertToSlug } from "../lib/helpers.js";
import { prisma } from "../lib/prisma.js";

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
        
        // Extract optionGroups
        const optionGroups = productData.optionGroups;
        delete productData.optionGroups;
        
        // If no optionGroups, just create normal product
        if (!optionGroups || optionGroups.length === 0) {
            return await this.repository.create(productData);
        }

        // With optionGroups, need a transaction
        return await prisma.$transaction(async (tx) => {
            const product = await this.repository.create(productData, tx);

            const optionGroupData = optionGroups.map(og => ({
                productId: product.id,
                optionGroupId: og.optionGroupId,
                sortOrder: og.sortOrder
            }));
            await tx.productOptionGroup.createMany({ data: optionGroupData });

            const optionValuesData = optionGroups.flatMap(og => 
                (og.optionValues || []).map(ov => ({
                    productId: product.id,
                    optionId: ov.optionId,
                    price: ov.price
                }))
            );
            
            if (optionValuesData.length > 0) {
                await tx.productOptionValue.createMany({ data: optionValuesData });
            }

            return product;
        });
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
