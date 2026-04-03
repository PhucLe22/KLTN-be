import { BaseRepository } from "./base.repository.js";

class CustomerRepository extends BaseRepository {
  constructor() {
    super("customer"); // Tên model trong prisma schema
  }

  // Tìm khách kèm theo lịch sử ví điểm (Loyalty)
  async findWithGoldHistory(customerId, tx = null) {
    return await this.getModel(tx).findUnique({
      where: { id: customerId },
      include: {
        pointTransactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }
}

export const customerRepository = new CustomerRepository();
