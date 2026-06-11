import { BaseRepository } from "./base.repository.js";

class AddressRepository extends BaseRepository {
  constructor() {
    super("address");
  }

  async findByCustomerId(customerId) {
    return await this.findOne({ customerId });
  }

  async clearDefault(customerId, tx = null) {
    return await this.getModel(tx).updateMany({
      where: { customerId, isDefault: true },
      data: { isDefault: false },
    });
  }
}

export const addressRepository = new AddressRepository();
