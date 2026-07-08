import express from "express";
import { authController } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/authentication.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerCustomer, forgotPassword, resetPassword } from "../contracts/input/auth.schema.js";

const authRouter = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Đăng ký khách hàng (Customer)
 * @access  Public
 */

authRouter.post(
  "/register",
  validate(registerCustomer),
  authController.registerCustomer,
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Đăng nhập bằng Email hoặc Số điện thoại
 * @access  Public
 */
authRouter.post("/login", authController.login);


/**
 * @route   POST /api/v1/auth/logout
 * @desc    Xóa refreshToken trong DB và xóa Cookie trình duyệt
 */
authRouter.post("/logout", authController.logout);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Cấp mới accessToken + refreshToken
 * @access  Public (cần refreshToken trong cookie)
 */
authRouter.post("/refresh", authController.refresh);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Lấy thông tin profile của user đang đăng nhập (Customer)
 * @access  Private (Cần Access Token)
 */
authRouter.get("/profile", protect, authController.getProfile);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Gửi email đặt lại mật khẩu
 * @access  Public
 */
authRouter.post(
  "/forgot-password",
  validate(forgotPassword),
  authController.forgotPassword,
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Đặt lại mật khẩu với token
 * @access  Public
 */
authRouter.post(
  "/reset-password",
  validate(resetPassword),
  authController.resetPassword,
);

export default authRouter;
