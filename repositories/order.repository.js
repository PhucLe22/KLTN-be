import { BaseRepository } from "./base.repository.js";

class OrderRepository extends BaseRepository {
  constructor() {
    super("order");
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
}

export const orderRepository = new OrderRepository();
