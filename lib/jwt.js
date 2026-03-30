import jwt from "jsonwebtoken";
import { UnauthorizedException } from "../lib/httpExceptions.js";

export class JwtHelper {
  static generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      throw new UnauthorizedException(
        "Access Token không hợp lệ hoặc đã hết hạn",
      );
    }
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new UnauthorizedException(
        "Refresh Token không hợp lệ hoặc đã hết hạn",
      );
    }
  }

  static decodeToken(token) {
    return jwt.decode(token);
  }
}
