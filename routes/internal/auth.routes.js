import express from "express";

import { authController } from "../../controllers/auth.controller.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { validateData } from "../../middlewares/validate.middleware.js";
import {
  registerStaffSchema,
  registerGuestSchema,
} from "../../contracts/input/auth.schema.js";

const authRouter = express.Router();

/**
 * @route   POST /api/v1/internal/auth/register/staff
 * @desc    Đăng ký nhân viên (Staff)
 */
authRouter.post(
  "/register/staff",
  protect,
  restrictTo("ADMIN"),
  validateData(registerStaffSchema),
  authController.registerStaff,
);

/**
 * @route   POST /api/v1/internal/auth/register/guest
 * @desc    Đăng ký khách vãng lai (Guest)
 */
authRouter.post(
  "/register/guest",
  protect,
  restrictTo("STAFF", "CASHIER", "MANAGER", "ADMIN"),
  validateData(registerGuestSchema),
  authController.registerGuest,
);

/** 
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Lấy Access Token mới từ Refresh Token trong Cookie
 */
authRouter.post("/refresh-token", authController.refresh);

export default authRouter;