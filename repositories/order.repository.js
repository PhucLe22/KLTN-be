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
}

export const orderRepository = new OrderRepository();
