import { BaseRepository } from "./base.repository.js";

class CategoryRepository extends BaseRepository {
  constructor() {
    super("category");
  }

  async findBySlug(slug, tx = null) {
    const model = this.getModel(tx);
    
    const category = await model.findFirst({
      where: {
        slug,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return category;
  }
}

export const categoryRepository = new CategoryRepository();
