import express from "express";

import { authController } from "../../controllers/auth.controller.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";

const authRouter = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Đăng ký người dùng (Customer/Staff/Guest)
 * @access  Public (Tạm thời để public để test, sau này sẽ gắn thêm middleware check quyền cho Staff)
 */
authRouter.post("/register/:type", protect, restrictTo("STAFF", "CASHIER", "MANAGER", "ADMIN"), authController.register);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Lấy Access Token mới từ Refresh Token trong Cookie
 */
authRouter.post("/refresh-token", authController.refresh);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Lấy thông tin profile của user đang đăng nhập
 * @access  Private (Cần Access Token)
 */
authRouter.get("/profile", protect, authController.getProfile);

export default authRouter;