// services/auth.service.js
import bcrypt from "bcrypt";

import { BaseService } from "./base.service.js";
import { userRepository } from "../repositories/user.repository.js";
import { customerRepository } from "../repositories/customer.repository.js";
import { staffRepository } from "../repositories/staff.repository.js";
import { tokenRepository } from "../repositories/token.repository.js";

import {
  BadRequestException,
  UnauthorizedException,
} from "../lib/httpExceptions.js";
import { prisma } from "../lib/prisma.js";
import { JwtHelper } from "../lib/jwt.js";
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from "../constants/errors.js";
import { UserType } from "../constants/enum.js";
class AuthService extends BaseService {
  constructor() {
    super(userRepository);
    this.userRepo = userRepository;
    this.customerRepo = customerRepository;
    this.staffRepo = staffRepository;
    this.tokenRepository = tokenRepository;
  }

  async register(type, data) {
    switch (type) {
      case "CUSTOMER":
        return await this.#registerCustomer(data);
      case "STAFF":
        return await this.#createStaff(data);
      case "GUEST":
        return await this.#quickCreateCustomer(data);
      default:
        throw new BadRequestException(VALIDATION_MESSAGES.USER_TYPE_INVALID);
    }
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
    await this.tokenRepository.revokeToken(refreshToken);
    return true;
  }

  // Làm mới Access Token bằng Refresh Token (Token Rotation)

  async refreshToken(oldRefreshTokenStr, reqInfo) {
    if (!oldRefreshTokenStr) {
      throw new UnauthorizedException(VALIDATION_MESSAGES.TOKEN_REQUIRED);
    }

    // Kiểm tra token còn hạn và chưa bị revoke trong DB
    const savedToken =
      await this.tokenRepository.findValidToken(oldRefreshTokenStr);

    if (!savedToken) {
      throw new UnauthorizedException(
        "Phiên đăng nhập đã hết hạn hoặc không hợp lệ",
      );
    }

    // Lấy thông tin user để build claims
    const user = await this.userRepo.findByIdWithProfile(savedToken.userId);
    if (!user) {
      throw new UnauthorizedException("Người dùng không tồn tại");
    }

    // THU HỒI TOKEN CŨ
    await this.tokenRepository.revokeToken(oldRefreshTokenStr);

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

    const isTaken = await this.userRepo.isIdentityTaken(email, phone);
    if (isTaken) {
      throw new BadRequestException("Email hoặc Số điện thoại đã được sử dụng");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return await this.userRepo.create(
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
      const customer = await this.customerRepo.create(
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

      const staff = await this.staffRepo.create(
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

    // Tận dụng findOne để tránh tạo trùng Profile khách vãng lai
    const existing = await this.customerRepo.findOne({ phone }, tx);
    if (existing) return existing;

    return await this.customerRepo.create(
      {
        phone,
        name,
      },
      tx,
    );
  }

  async #validateUserCredentials(identifier, password) {
    const user = await this.userRepo.findByIdentifier(identifier);

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH_INVALID);
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH_INVALID);
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
    await this.tokenRepository.upsertSession({
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
}

export const authService = new AuthService();
