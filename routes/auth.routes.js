import express from "express";
import { authController } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/authentication.middleware.js";
import { validateData } from "../middlewares/validate.middleware.js";
import { registerCustomerSchema } from "../contracts/input/auth.schema.js";

const authRouter = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Đăng ký khách hàng (Customer)
 * @access  Public
 */

authRouter.post(
  "/register",
  validateData(registerCustomerSchema),
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
 * @route   GET /api/v1/auth/profile
 * @desc    Lấy thông tin profile của user đang đăng nhập (Customer)
 * @access  Private (Cần Access Token)
 */
authRouter.get("/profile", protect, authController.getProfile);

export default authRouter;
