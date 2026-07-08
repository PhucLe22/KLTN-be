import { MODELS } from "../constants/models.js";
import { BaseRepository } from "./base.repository.js";

class ProductRepository extends BaseRepository {
    constructor() {
        super(MODELS.product);
    }

    async findAll(query, tx = null) {
        const { page = 1, limit = 10, categoryId, search, sortBy = "createdAt", sortOrder = "desc", type, isActive = "true" } = query;

        const where = {};

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                { category: { name: { contains: search, mode: "insensitive" } } }
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
            slug: true,
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

        return await super.findAll({
            page,
            limit,
            where,
            select,
            orderBy: [{ [sortBy]: sortOrder }]
        }, tx);
    }

    async findById(id, tx = null) {
        const model = this.getModel(tx);
        return await model.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                basePrice: true,
                sku: true,
                thumbnail: true,
                isActive: true
            }
        });
    }

    async findBySlug(slug, tx = null) {
        const model = this.getModel(tx);

        return await model.findFirst({
            where: {
                slug,
                isActive: true
            },
            select: {
                id: true,
                sku: true,
                name: true,
                slug: true,
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
                optionGroups: {
                    where: {
                        optionGroup: {
                            isActive: true
                        }
                    },
                    select: {
                        optionGroup: {
                            select: {
                                id: true,
                                name: true,
                                isRequired: true,
                                isMultiple: true,
                                sortOrder: true,
                                options: {
                                    where: {
                                        isActive: true
                                    },
                                    select: {
                                        id: true,
                                        name: true,
                                        basePrice: true,
                                        sortOrder: true,
                                        isActive: true
                                    }
                                }
                            }
                        }
                    }
                },
                optionValues: {
                    select: {
                        optionId: true,
                        price: true
                    }
                },
                sortOrder: true,
                preparationTime: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }
}

export const productRepository = new ProductRepository();