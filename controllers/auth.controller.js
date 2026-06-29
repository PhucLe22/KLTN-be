import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { mapper } from "../lib/mapper.js";
import { AuthMap, GuestMap, LoginMap, ProfileMap } from "../contracts/output/auth.output.schema.js";
import { CookieHelper } from "../lib/cookieHelper.js";
import { SUCCESS_MESSAGES } from "../constants/success.js";

class AuthController {
  /**
   * Đăng ký khách hàng
   */
  registerCustomer = asyncHandler(async (req, res) => {
    const data = req.body;
    const auth = await authService.registerCustomer(data);
    const result = mapper(auth.user, AuthMap);

    return res.ok(result);
  });

  /**
   * Đăng ký nhân viên
   */
  registerStaff = asyncHandler(async (req, res) => {
    const data = req.body;
    const auth = await authService.registerStaff(data);
    const result = mapper(auth.user, AuthMap);

    return res.ok(result);
  });

  /**
   * Đăng ký khách vãng lai (Guest)
   */
  registerGuest = asyncHandler(async (req, res) => {
    const data = req.body;
    const customer = await authService.registerGuest(data);
    const result = mapper(customer.customer, GuestMap);

    return res.ok(result);
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

    const auth = await authService.login({ identifier, password }, reqInfo);
    
    CookieHelper.setRefreshToken(res, auth.tokens.refreshToken);

    const result = mapper(auth, LoginMap, { tokens: auth.tokens });

    return res.ok(result, null, SUCCESS_MESSAGES.LOGIN_SUCCES);
  });

  /**
   * Đăng xuất
   */
  logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    await authService.logout(refreshToken);
    CookieHelper.clearRefreshToken(res);

    return res.ok({}, null, SUCCESS_MESSAGES.LOUGOUT);
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

    const auth = await authService.refreshToken(oldRefreshToken, reqInfo);

    CookieHelper.setRefreshToken(res, auth.tokens.refreshToken);

    const result = mapper(auth, LoginMap, { tokens: auth.tokens });

    return res.ok(result, null, SUCCESS_MESSAGES.RENEW_TOKEN);
  });

  /**
   * Lấy profile của user đang đăng nhập
   */
  getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);
    const result = mapper(user, ProfileMap);

    return res.ok(result);
  });
}

export const authController = new AuthController();
