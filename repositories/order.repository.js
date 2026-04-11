import { BaseRepository } from "./base.repository.js";

class OrderRepository extends BaseRepository {
  constructor() {
    super("order");
  }
}

export const orderRepository = new OrderRepository();
