import { BaseController } from "./base.controller.js";
import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { AuthMapper } from "../mappers/auth.mapper.js";
import { CookieHelper } from "../lib/cookieHelper.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";

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

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.CREATED,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.CREATED],
      data:
        result.type === "GUEST"
          ? AuthMapper.toGuestResponse(result)
          : AuthMapper.toAccountResponse(result.user),
    });
  });

  /**
   * Đăng nhập
   */
  login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    console.log("identifier", identifier);
    console.log("password", password);

    const reqInfo = {
      deviceInfo: req.headers["user-agent"],
      ipAddress: req.ip || req.headers["x-forwarded-for"],
    };

    const result = await this.service.login({ identifier, password }, reqInfo);
    console.log(result);

    CookieHelper.setRefreshToken(res, result.tokens.refreshToken);

    return this.success(res, {
      message: SUCCESS_MESSAGES.LOGIN_SUCCES,
      data: AuthMapper.toAccountWithTokensResponse(result.user, result.tokens),
    });
  });

  /**
   * Đăng xuất
   */
  logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    await this.service.logout(refreshToken);
    CookieHelper.clearRefreshToken(res);

    return this.success(res, { message: SUCCESS_MESSAGES.LOUGOUT });
  });

  /**
   * Làm mới Access Token
   */
  refresh = asyncHandler(async (req, res) => {
    const oldRefreshToken = req.cookies.refreshToken;

    const reqInfo = {
      deviceInfo: req.headers["user-agent"],
      ipAddress: req.ip || req.headers["x-forwarded-for"],
    };

    const result = await this.service.refreshToken(oldRefreshToken, reqInfo);

    CookieHelper.setRefreshToken(res, result.tokens.refreshToken);

    return this.success(res, {
      message: SUCCESS_MESSAGES.RENEW_TOKEN,
      data: AuthMapper.toAccountWithTokensResponse(result.user, result.tokens),
    });
  });

  /**
   * Lấy profile của user đang đăng nhập
   */
  getProfile = asyncHandler(async (req, res) => {
    const user = await this.service.getProfile(req.user.id);

    const profileData = AuthMapper.toProfileResponse(user);

    return this.success(res, {
      data: profileData,
    });
  });
}

export const authController = new AuthController();
