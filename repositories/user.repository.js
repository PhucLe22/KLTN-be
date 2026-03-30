import { BaseRepository } from "./base.repository.js";

class UserRepository extends BaseRepository {
  constructor() {
    super("user"); // Tên model trong schema.prisma (User -> user)
  }

  // Viết thêm các hàm đặc thù chỉ User mới có
  async findByEmail(email) {
    return await this.model.findUnique({
      where: { email },
      include: { staff: true, customer: true },
    });
  }
}

export const userRepository = new UserRepository();
