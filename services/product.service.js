import { productRepository } from "../repositories/product.repository.js";
import { optionGroupRepository } from "../repositories/option-group.repository.js";
import { createSlug } from "../lib/helpers.js";
import { prisma } from "../lib/prisma.js";
import { ERR } from "../lib/httpExceptions.js";

class ProductService  {

    get repository() {
        return productRepository;
    }

    async findAll(query) {
        return await productRepository.findAll(query);
    }

    async findBySlug(slug) {
        const product = await productRepository.findBySlug(slug);
        if (!product) throw ERR.NotFound(`Product ${slug} not found`)
        return product;
    }

    async generateSlug(name) {
        return await createSlug(prisma.product, name);
    }

    async create(data) {
        const productData = { 
            ...data,
            basePrice: data.basePrice ? Number(data.basePrice) : undefined,
            taxRate: data.taxRate ? Number(data.taxRate) : undefined,
            sortOrder: data.sortOrder ? Number(data.sortOrder) : undefined
        };
        
        // Generate slug from name if not provided
        if (productData.name && !productData.slug) {
            productData.slug = await this.generateSlug(productData.name);
        }

        // Convert nested category object to categoryId for Prisma
        let category = productData.category;
        if (typeof category === 'string') {
            try {
                category = JSON.parse(category);
            } catch (e) {
                category = null;
            }
        }
        if (category && category.id) {
            productData.categoryId = category.id;
            delete productData.category;
        } else {
            delete productData.category;
        }
        
        // Extract optionGroups
        let optionGroups = productData.optionGroups || [];
        if (typeof optionGroups === 'string') {
            try {
                optionGroups = JSON.parse(optionGroups);
            } catch (e) {
                optionGroups = [];
            }
        }
        delete productData.optionGroups;

        // Ensure every product has default "Size" option group
        const sizeGroup = await prisma.optionGroup.findFirst({
            where: { name: { equals: "Size", mode: "insensitive" }, isActive: true },
            include: { options: { where: { isActive: true } } }
        });

        if (sizeGroup) {
            const isSizePresent = optionGroups.some(og => og.optionGroupId === sizeGroup.id);
            if (!isSizePresent) {
                optionGroups.push({
                    optionGroupId: sizeGroup.id,
                    sortOrder: optionGroups.length + 1,
                    optionValues: sizeGroup.options.map(opt => ({
                        optionId: opt.id,
                        price: opt.basePrice
                    }))
                });
            }
        }
        
        // If no optionGroups (even after trying to add Size), just create normal product
        if (optionGroups.length === 0) {
            return await productRepository.create(productData);
        }

        // With optionGroups, need a transaction
        return await prisma.$transaction(async (tx) => {
            const product = await productRepository.create(productData, tx);

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
            updateData.slug = await createSlug(prisma.product, updateData.name) 
        }

        // Convert nested category object to categoryId for Prisma
        if (updateData.category && updateData.category.id) {
            updateData.categoryId = updateData.category.id;
            delete updateData.category;
        }

        // Handle optionGroups update
        const optionGroups = updateData.optionGroups;
        delete updateData.optionGroups;

        if (optionGroups && optionGroups.length > 0) {
            return await prisma.$transaction(async (tx) => {
                const product = await productRepository.update(id, updateData, tx);

                // Remove existing option group links
                await tx.productOptionGroup.deleteMany({ where: { productId: id } });
                await tx.productOptionValue.deleteMany({ where: { productId: id } });

                // Create new option group links
                const pogData = optionGroups.map(og => ({
                    productId: id,
                    optionGroupId: og.optionGroupId,
                    sortOrder: og.sortOrder
                }));
                await tx.productOptionGroup.createMany({ data: pogData });

                // Create new option values
                const povData = optionGroups.flatMap(og =>
                    (og.optionValues || []).map(ov => ({
                        productId: id,
                        optionId: ov.optionId,
                        price: ov.price
                    }))
                );
                if (povData.length > 0) {
                    await tx.productOptionValue.createMany({ data: povData });
                }

                return product;
            });
        }
        
        return await productRepository.update(id, updateData);
    }

    async updateProductOptionGroup(productId, optionGroupId, data) {
        return await optionGroupRepository.updateProductOptionGroup(productId, optionGroupId, data);
    }

    async toggleActive(id) {
        const product = await productRepository.findById(id);
        if (!product) throw ERR.NotFound(`Product ${id} not found`);
        return await productRepository.update(id, { isActive: !product.isActive });
    }

    async delete(id) {
        return await productRepository.update(id, { isActive: false });
    }
}

export const productService = new ProductService();
