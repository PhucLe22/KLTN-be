import { BaseRepository } from "./base.repository.js";

class ProductRepository extends BaseRepository {
    constructor() {
        super("product");
    }

    async findBySlug(slug, tx = null) {
        const model = this.getModel(tx);

        const product = await model.findFirst({
            where: {
                slug: slug,
                isActive: true
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