import { BaseRepository } from "./base.repository.js";

class OrderRepository extends BaseRepository {
  constructor() {
    super("order");
  }

  async findByIdWithRelations(id, tx = null) {
    return await this.getModel(tx).findUnique({
      where: { id },
      include: {
        store: true,
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findByOrderCode(orderCode, tx = null) {
    const model = this.getModel(tx);

    const order = await model.findFirst({
      where: {
        orderCode: orderCode,
      },
      include: {
        store: true,
        customer: true,
        items: true,
      },
    });

    return order;
  }

  /**
   * Lấy danh sách orders theo store (cho admin/manager)
   */
  async findByStore(storeId, query = {}, tx = null) {
    const { page = 1, limit = 10, status } = query;

    const where = {
      storeId: storeId,
    };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.getModel(tx).findMany({
        where,
        include: {
          store: true,
          customer: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.getModel(tx).count({ where }),
    ]);

    return {
      items: orders,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrdersByUser(userId, query = {}) {
    const { page = 1, limit = 10 } = query;

    return await this.findAll({
      page: Number(page),
      limit: Number(limit),
      where: {
        customer: {
          userId: userId,
        },
      },
      include: {
        store: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Generic method with pre-built filters from buildOrderFilters
   * @param {{ where: Object, page: number, limit: number }} filters
   */
  async getOrdersByFilters(filters) {
    const { where, page, limit } = filters;

    return await this.findAll({
      page,
      limit,
      where,
      include: {
        store: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const orderRepository = new OrderRepository();
