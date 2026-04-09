const MODEL_NAME = "user";
import { BaseRepository } from "./base.repository.js";

class UserRepository extends BaseRepository {
  constructor() {
    super(MODEL_NAME); // Tên model trong schema.prisma
  }
  /**
   * Tìm User bằng Email HOẶC Số điện thoại
   */
  async findByIdentifier(identifier, tx = null) {
    return await this.getModel(tx).findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
        isActive: true, // Chỉ cho phép user đang hoạt động login
      },
      include: {
        staff: { include: { store: true } },
        customer: true,
      },
    });
  }
  /**
   * Tìm User kèm theo cả Profile Staff hoặc Customer
   */
  async findByIdWithProfile(id, tx = null) {
    return await this.getModel(tx).findUnique({
      where: {
        id,
        isActive: true, // Nên thêm cái này để check user còn hoạt động không
      },
      include: {
        staff: { include: { store: true } },
        customer: true,
      },
    });
  }

  /**
   * Tìm theo Email ( dùng cho Staff/Admin login)
   */
  async findByEmail(email, tx = null) {
    return await this.findOne({ email }, { staff: true, customer: true }, tx);
  }

  /**
   * Tìm theo sđt ( dùng cho Customer login)
   */
  async findByPhone(phone, tx = null) {
    return await this.findOne({ phone }, { staff: true, customer: true }, tx);
  }

  /**
   * Kiểm tra nhanh xem Email hoặc Phone đã được tạo chưa
   * Trả về true nếu đã tồn tại
   */
  async isIdentityTaken(email, phone, tx = null) {
    const conditions = [];
    if (email) conditions.push({ email });
    if (phone) conditions.push({ phone });

    if (conditions.length === 0) return false;

    const user = await this.getModel(tx).findFirst({
      where: {
        OR: conditions,
      },
    });

    return !!user;
  }
}

export const userRepository = new UserRepository();
