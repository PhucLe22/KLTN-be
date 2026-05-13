import { BaseRepository } from "./base.repository.js";

class CategoryRepository extends BaseRepository {
  constructor() {
    super("category");
  }

  async findAll(query, tx = null) {
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

    return await super.findAll({
      page,
      limit,
      where,
      select,
      orderBy: { [sortBy]: sortOrder }
    }, tx);
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
