import express from "express";
import { authController } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/authentication.middleware.js";

const authRouter = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Đăng ký người dùng (Customer/Staff/Guest)
 * @access  Public (Tạm thời để public để test, sau này sẽ gắn thêm middleware check quyền cho Staff)
 */
authRouter.post("/register/:type", authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Đăng nhập bằng Email hoặc Số điện thoại
 * @access  Public
 */
authRouter.post("/login", authController.login);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Lấy Access Token mới từ Refresh Token trong Cookie
 */
authRouter.post("/refresh-token", authController.refresh);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Xóa refreshToken trong DB và xóa Cookie trình duyệt
 */
authRouter.post("/logout", authController.logout);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Lấy thông tin profile của user đang đăng nhập
 * @access  Private (Cần Access Token)
 */
authRouter.get("/profile", protect, authController.getProfile);

export default authRouter;
