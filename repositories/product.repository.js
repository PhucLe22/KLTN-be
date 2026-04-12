import { BaseRepository } from "./base.repository.js";

class ProductRepository extends BaseRepository {
    constructor() {
        super("product");
    }

    async findBySlug(slug, tx = null) {
        const model = this.getModel(tx);

        // Convert slug to search pattern (handle Vietnamese characters)
        // For now, simple search by name containing the slug parts
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