import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { ERR } from "../lib/httpExceptions.js";
import { ERROR_MESSAGES } from "../constants/errors.js";
export class JwtHelper {
  /**
   * generate Access Token
   */
  static generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    });
  }

  /**
   * generate Opaque Refresh Token
   * Không dùng jwt.sign vì lưu ID này vào DB
   */
  static generateRefreshTokenString() {
    return uuidv4();
  }

  /**
   * Xác thực Access Token
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      const message =
        error.name === "TokenExpiredError"
          ? ERROR_MESSAGES.AUTH_TOKEN_EXPIRED
          : ERROR_MESSAGES.AUTH_TOKEN_INVALID;

      throw ERR.Unauthorized(message);
    }
  }
}
