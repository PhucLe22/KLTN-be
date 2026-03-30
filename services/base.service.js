import {
  InternalServerErrorException,
  NotFoundException,
} from "../lib/httpExceptions.js";

export class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  // Lấy danh sách phân trang (ủy quyền cho Repo)
  async getPaginated(query) {
    try {
      return await this.repository.paginate(query);
    } catch (error) {
      throw new InternalServerErrorException(
        "Lỗi khi lấy danh sách: " + error.message,
      );
    }
  }

  // Lấy chi tiết một bản ghi
  async getById(id, include = null) {
    const item = await this.repository.findById(id, include);
    if (!item) {
      throw new NotFoundException(`Không tìm thấy bản ghi với ID: ${id}`);
    }
    return item;
  }

  // Xóa một bản ghi
  async delete(id) {
    await this.getById(id); // Check xem có tồn tại không trước khi xóa
    return await this.repository.delete(id);
  }

  /**
   * Helper để chạy Prisma Transaction
   * Giúp Service con có thể gom nhiều thao tác vào 1 phiên làm việc
   */
  async executeTransaction(work) {
    try {
      // Prisma $transaction nhận vào một callback chứa client tạm thời (tx)
      return await this.repository.model._client.$transaction(work);
    } catch (error) {
      throw error; // Để Error Middleware xử lý (P2002, P2025...)
    }
  }
}
