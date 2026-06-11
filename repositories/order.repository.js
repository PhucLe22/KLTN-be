import { MODELS } from "../constants/models.js";
import { BaseRepository } from "./base.repository.js";

class OrderRepository extends BaseRepository {
  constructor() {
    super(MODELS.order);
  }

  async findByIdWithRelations(id, tx = null) {
    return await this.getModel(tx).findUnique({
      where: { id },
      include: {
        store: true,
        customer: true,
        delivery: {
          include: {
            assignedShipper: { include: { user: true } }
          }
        },
        assignedChef: { include: { user: true } },
        items: {

          include: {
            product: true,
            options: true,
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
    const filters = {
      where: {
        customer: {
          userId: userId,
        },
      },
      page: Number(query.page || 1),
      limit: Number(query.limit || 10),
    };

    return await this.getOrdersByFilters(filters);
  }

  async getOrdersByStoreId(storeId, query = {}) {
    const { page = 1, limit = 10, status } = query;
    const where = { storeId };
    if (status) where.status = status;

    return await this.findAll({
      page: Number(page),
      limit: Number(limit),
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
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
        delivery: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id, status, tx = null) {
    return await this.getModel(tx).update({
      where: { id },
      data: { status },
      include: {
        store: true,
        customer: true,
        delivery: true,
        items: true,
      },
    });
  }
}

export const orderRepository = new OrderRepository();
