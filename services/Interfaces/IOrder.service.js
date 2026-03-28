export class IOrderService {
  async create(orderData, userId) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED: create");
  }

  async findAll(query) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED: findAll");
  }

  async findById(id) {
    throw new Error("ERR_METHOD_NOT_IMPLEMENTED: findById");
  }
}
