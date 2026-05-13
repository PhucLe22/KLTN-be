import express from "express";
import { authController } from "../controllers/auth.controller.js";

const authRouter = express.Router();

/**
 * @route   POST /api/v1/auth/register/:type
 * @desc    Đăng ký người dùng (Customer/Staff/Guest)
 * @access  Public
 */

authRouter.post("/register/:type", authController.register);

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


export default authRouter;
