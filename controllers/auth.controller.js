import { BaseController } from "./base.controller.js";
import { authService } from "../services/auth.service.js";
import { CREATED, OK } from "../lib/successResponse.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { AuthMapper } from "../mappers/auth.mapper.js";
import { CookieHelper } from "../lib/cookieHelper.js";
class AuthController extends BaseController {
  constructor() {
    super(authService);
  }

  /**
   * Đăng ký
   */
  register = asyncHandler(async (req, res) => {
    const data = req.body;
    const { type } = req.params;

    const result = await this.service.register(type.toUpperCase(), data);

    if (type.toUpperCase() === "GUEST") {
      return CREATED(
        res,
        AuthMapper.toGuestResponse(result),
        "Tạo khách vãng lai thành công",
      );
    }
    return CREATED(
      res,
      AuthMapper.toAccountResponse(result.user),
      "Đăng ký thành công",
    );
  });
  login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    // Lấy thông tin thiết bị để lưu session
    const reqInfo = {
      deviceInfo: req.headers["user-agent"],
      ipAddress: req.ip || req.headers["x-forwarded-for"],
    };

    const result = await this.service.login({ identifier, password }, reqInfo);
    CookieHelper.setRefreshToken(res, result.tokens.refreshToken);
    return OK(
      res,
      AuthMapper.toAccountWithTokensResponse(result.user, result.tokens),
      "Đăng nhập thành công",
    );
  });

  /**
   * Đăng xuất
   */
  logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    await this.service.logout(refreshToken);

    CookieHelper.clearRefreshToken(res);

    return OK(res, null, "Đăng xuất thành công");
  });

  /**
   * Làm mới Access Token
   */
  refresh = asyncHandler(async (req, res) => {
    // Lấy refresh token từ cookie
    const oldRefreshToken = req.cookies.refreshToken;

    const reqInfo = {
      deviceInfo: req.headers["user-agent"],
      ipAddress: req.ip || req.headers["x-forwarded-for"],
    };

    const result = await this.service.refreshToken(oldRefreshToken, reqInfo);

    // Set Refresh Token mới
    CookieHelper.setRefreshToken(res, result.tokens.refreshToken);

    return OK(
      res,
      AuthMapper.toAccountWithTokensResponse(result.user, result.tokens),
      "Làm mới token thành công",
    );
  });
}

export const authController = new AuthController();
