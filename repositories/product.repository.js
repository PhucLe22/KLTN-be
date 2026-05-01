import { BaseRepository } from "./base.repository.js";

class ProductRepository extends BaseRepository {
    constructor() {
        super("product");
    }

    async findById(id, tx = null) {
        const model = this.getModel(tx);
        return await model.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                basePrice: true,
                sku: true,
                thumbnail: true
            }
        });
    }

    async findBySlug(slug, tx = null) {
        const model = this.getModel(tx);

        const searchName = slug.replace(/-/g, ' ');

        const product = await model.findFirst({
            where: {
                isActive: true,
                name: {
                    contains: searchName,
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                name: true,
                description: true,
                basePrice: true,
                thumbnail: true
            }
        });

        return product;
    }
}

export const productRepository = new ProductRepository();