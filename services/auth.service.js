import bcrypt from "bcrypt";

import { userRepository } from "../repositories/user.repository.js";
import { customerRepository } from "../repositories/customer.repository.js";
import { staffRepository } from "../repositories/staff.repository.js";
import { tokenRepository } from "../repositories/token.repository.js";

import { ERR } from "../lib/httpExceptions.js";
import { prisma } from "../lib/prisma.js";
import { JwtHelper } from "../lib/jwt.js";
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from "../constants/errors.js";
import { UserType } from "../constants/enum.js";
class AuthService {

  async registerCustomer(data) {
    return await this.#registerCustomer(data);
  }

  async registerStaff(data) {
    return await this.#createStaff(data);
  }

  async registerGuest(data) {
    const customer = await this.#quickCreateCustomer(data);
    return { type: UserType.GUEST, customer };
  }

  async login({ identifier, password }, reqInfo) {
    // Kiểm tra đăng nhập
    const user = await this.#validateUserCredentials(identifier, password);

    // Cấp Token
    const { accessToken, refreshToken } = await this.#issueTokens(
      user,
      reqInfo,
    );

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  // Logout
  async logout(refreshToken) {
    if (!refreshToken) return false;
    await tokenRepository.revokeToken(refreshToken);
    return true;
  }

  // Làm mới Access Token bằng Refresh Token (Token Rotation)

  async refreshToken(oldRefreshTokenStr, reqInfo) {
    if (!oldRefreshTokenStr) {
      throw ERR.Unauthorized(VALIDATION_MESSAGES.TOKEN_REQUIRED);
    }

    // Kiểm tra token còn hạn và chưa bị revoke trong DB
    const savedToken =
      await tokenRepository.findValidToken(oldRefreshTokenStr);

    if (!savedToken) {
      throw ERR.Unauthorized(
        "Phiên đăng nhập đã hết hạn hoặc không hợp lệ",
      );
    }

    // Lấy thông tin user để build claims
    const user = await userRepository.findByIdWithProfile(savedToken.userId);
    if (!user) {
      throw ERR.Unauthorized("Người dùng không tồn tại");
    }

    // THU HỒI TOKEN CŨ
    await tokenRepository.revokeToken(oldRefreshTokenStr);

    // CẤP TOKENS MỚI
    const { accessToken, refreshToken } = await this.#issueTokens(
      user,
      reqInfo,
    );

    return {
      user,
      tokens: { accessToken, refreshToken },
    };
  }

  // Logic tạo Identity chung

  async #createUserIdentity(data, tx) {
    const { email, phone, password } = data;

    const isTaken = await userRepository.isIdentityTaken(email, phone);
    if (isTaken) {
      throw ERR.BadRequest("Email hoặc Số điện thoại đã được sử dụng");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return await userRepository.create(
      {
        email,
        phone,
        password: hashedPassword,
      },
      tx,
    );
  }

  /**
   * ĐĂNG KÝ KHÁCH HÀNG
   */
  async #registerCustomer(data) {
    // Transaction
    return await prisma.$transaction(async (tx) => {
      // Tạo User (Identity)
      const user = await this.#createUserIdentity(data, tx);

      // Tạo Customer (Profile)
      const customer = await customerRepository.create(
        {
          userId: user.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
        },
        tx,
      );
      return { user, customer };
    });
  }

  /**
   * TẠO TÀI KHOẢN STAFF
   */
  async #createStaff(data) {
    return await prisma.$transaction(async (tx) => {
      const user = await this.#createUserIdentity(data, tx);

      const staff = await staffRepository.create(
        {
          userId: user.id,
          storeId: data.storeId,
          role: data.role,
        },
        tx,
      );

      return { user, staff };
    });
  }
  /**
   * TẠO CUSTOMER không cần account
   */

  async #quickCreateCustomer(data, tx = null) {
    const { phone, name } = data;
    console.log("phone", phone);
    console.log("name", name);

    // Tận dụng findOne để tránh tạo trùng Profile khách vãng lai
    const existing = await customerRepository.findOne({ phone }, tx);
    if (existing) return existing;

    return await customerRepository.create(
      {
        phone,
        name,
      },
      tx,
    );
  }

  async #validateUserCredentials(identifier, password) {
    const user = await userRepository.findByIdentifier(identifier);

    if (!user) {
      throw ERR.Unauthorized(ERROR_MESSAGES.AUTH_INVALID);
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw ERR.Unauthorized(ERROR_MESSAGES.AUTH_INVALID);
    }

    return user;
  }
  /**
   * Tạo Access Token & Refresh Token, lưu Refresh Token vào DB
   */
  async #issueTokens(user, reqInfo) {
    // Tạo JWT Claims cơ bản
    const claims = this.#buildClaims(user);
    // Tạo Access Token
    const accessToken = JwtHelper.generateAccessToken(claims);
    //  Tạo Opaque Refresh Token
    const refreshTokenString = JwtHelper.generateRefreshTokenString();

    //  Lưu/ ghi đè Token
    await tokenRepository.upsertSession({
      userId: user.id,
      token: refreshTokenString,
      ipAddress: reqInfo.ipAddress,
      deviceInfo: reqInfo.deviceInfo,
      expiresAt: this.#getRefreshTokenExpireDate(),
    });

    return { accessToken, refreshToken: refreshTokenString };
  }
  #buildClaims(user) {
    const claims = {
      sub: user.id,
    };

    if (user.staff) {
      claims.type = UserType.STAFF;
      claims.role = user.staff.role;
      claims.sid = user.staff.id;
      claims.storeId = user.staff.storeId;
    } else if (user.customer) {
      claims.type = UserType.CUSTOMER;
      claims.cid = user.customer.id;
    }

    return claims;
  }
  #getRefreshTokenExpireDate() {
    const days = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }

  async getProfile(userId) {
    const user = await userRepository.findByIdWithProfile(userId);

    if (!user) {
      throw ERR.Unauthorized("Người dùng không tồn tại");
    }

    // Nếu là STAFF và không phải là MANAGER/ADMIN, tìm thêm thông tin MANAGER của store đó
    if (
      user.staff &&
      user.staff.role !== "MANAGER" &&
      user.staff.role !== "ADMIN" &&
      user.staff.role !== "OWNER"
    ) {
      const manager = await staffRepository.findManagerByStore(user.staff.storeId);
      user.staff.manager = manager;
    }

    return user;
  }
}

export const authService = new AuthService();
