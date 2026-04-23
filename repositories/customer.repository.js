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

  async findCustomerByUserId(userId, tx = null) {
    return await this.getModel(tx).findUnique({
      where: { userId: userId },
    });
  }

  // Find or create customer by phone for guest orders
  async findOrCreateGuestCustomer(phone, name, tx = null) {
    let customer = await this.getModel(tx).findFirst({
      where: { phone: phone },
    });

    if (!customer) {
      customer = await this.getModel(tx).create({
        data: {
          name: name,
          phone: phone,
          tier: "BRONZE",
          points: 0,
          isActive: true,
        },
      });
    }

    return customer;
  }
}

export const customerRepository = new CustomerRepository();
