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

  // Tìm khách hàng theo phone
  async findByPhone(phone, tx = null) {
    return await this.getModel(tx).findUnique({
      where: { phone },
      include: {
        user: true,
      },
    });
  }

  // Tìm khách hàng theo email
  async findByEmail(email, tx = null) {
    return await this.getModel(tx).findFirst({
      where: { email },
      include: {
        user: true,
      },
    });
  }

  // Tìm khách hàng theo tên
  async findByName(name, tx = null) {
    return await this.getModel(tx).findFirst({
      where: { name },
      include: {
        user: true,
      },
    });
  }

  // Tìm khách hàng theo userId
  async findCustomerByUserId(userId, tx = null) {
    return await this.getModel(tx).findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });
  }

  // Tìm khách hàng theo phone, không có thì create guest
  async findOrCreateGuestCustomer(phone, name, email = null, tx = null) {
    let customer = await this.findByPhone(phone, tx);
    
    if (!customer) {
      customer = await this.create({ phone, name, email }, tx);
    } else if (name && customer.name !== name) {
      // Update name if different
      customer = await this.update(customer.id, { name, email }, tx);
    }
    
    return customer;
  }
}

export const customerRepository = new CustomerRepository();
