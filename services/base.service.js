export class BaseService {
  constructor(repository) {
    this.repository = repository;
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
