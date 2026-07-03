import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { CookieHelper } from "../lib/cookieHelper.js";
import { AuthMapper } from "../mappers/auth.mapper.js";
import { authService } from "../services/auth.service.js";
import { BaseController } from "./base.controller.js";

class AuthController extends BaseController {
  constructor() {
    super(authService);
  }

  /**
   * Đăng ký khách hàng
   */
  registerCustomer = asyncHandler(async (req, res) => {
    const data = req.body;
    const result = await this.service.registerCustomer(data);

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.CREATED,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.CREATED],
      data: AuthMapper.toAccountResponse(result.user),
    });
  });

  /**
   * Đăng ký nhân viên
   */
  registerStaff = asyncHandler(async (req, res) => {
    const data = req.body;
    const result = await this.service.registerStaff(data);

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.CREATED,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.CREATED],
      data: AuthMapper.toAccountResponse(result.user),
    });
  });

  /**
   * Đăng ký khách vãng lai (Guest)
   */
  registerGuest = asyncHandler(async (req, res) => {
    const data = req.body;
    const result = await this.service.registerGuest(data);

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.CREATED,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.CREATED],
      data: AuthMapper.toGuestResponse(result.customer),
    });
  });

  /**
   * Đăng nhập
   */
  login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    const reqInfo = {
      deviceInfo: req.headers["user-agent"],
      ipAddress: req.ip || req.headers["x-forwarded-for"],
    };

    const result = await this.service.login({ identifier, password }, reqInfo);
    console.log("result", result);

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
    console.log("Cookies:", req.cookies);
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

  forgotPasswordOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await this.service.forgotPasswordOtp(email);
    return this.success(res, { message: SUCCESS_MESSAGES.SEND_FORGOT_PASSWORD_OTP, data: result });
  });

  verifyForgotPasswordOtp = asyncHandler(async(req, res) => {
    const { email, code } = req.body;
    const result = await this.service.verifyForgotPasswordOtp(email, code);
    return this.success(res, { message: SUCCESS_MESSAGES.VERIFY_FORGOT_PASSWORD_OTP, data: result });
  });

  resetPasswordOtp = asyncHandler(async (req, res) => {
    const { email, code, newPassword } = req.body;
    const result = await this.service.resetPasswordOtp(email, code, newPassword);
    return this.success(res, { message: SUCCESS_MESSAGES.RESET_PASSWORD, data: result });
  });
}

export const authController = new AuthController();
