import { BaseRepository } from "./base.repository.js";

class TokenRepository extends BaseRepository {
  constructor() {
    super("refreshToken");
  }

  /**
   * Tìm một token còn hiệu lực trong DB
   * @param {string} tokenStr - Chuỗi UUID gửi từ Client
   */
  async findValidToken(tokenStr) {
    return await this.findOne({
      token: tokenStr,
      isRevoked: false,
      expiresAt: {
        gt: new Date(),
      },
    });
  }

  /**
   * Thu hồi 1 token cụ thể (Logout)
   */
  async revokeToken(tokenStr) {
    const result = await this.getModel().updateMany({
      where: { token: tokenStr, isRevoked: false },
      data: { isRevoked: true },
    });
    return result.count > 0;
  }

  /**
   * Thu hồi toàn bộ session của User (Đổi pass, khóa acc)
   */
  async revokeAllUserTokens(userId, tx = null) {
    return await this.getModel(tx).updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  // repositories/token.repository.js
  async upsertSession(
    { userId, ipAddress, deviceInfo, token, expiresAt },
    tx = null,
  ) {
    // Lấy model
    const model = this.getModel(tx);

    // Xóa (hoặc vô hiệu hóa) các token cũ của cùng User trên cùng thiết bị/IP
    await model.deleteMany({
      where: {
        userId: userId,
        ipAddress: ipAddress,
        deviceInfo: deviceInfo,
      },
    });

    // Tạo Token mới
    return await model.create({
      data: {
        token,
        userId,
        ipAddress,
        deviceInfo,
        expiresAt,
      },
    });
  }
}

export const tokenRepository = new TokenRepository();
