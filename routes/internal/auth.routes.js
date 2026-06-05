import express from "express";

import { authController } from "../../controllers/auth.controller.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { StaffRole, UserType } from "../../constants/enum.js";
import {
  registerStaff,
  registerGuest,
} from "../../contracts/input/auth.schema.js";

const authRouter = express.Router();

/**
 * @route   POST /api/v1/internal/auth/register/staff
 * @desc    Đăng ký nhân viên (Staff)
 */
authRouter.post(
  "/register/staff",
  protect,
  restrictTo(StaffRole.ADMIN),
  validate(registerStaff),
  authController.registerStaff,
);

/**
 * @route   POST /api/v1/internal/auth/register/guest
 * @desc    Đăng ký khách vãng lai (Guest)
 */
authRouter.post(
  "/register/guest",
  protect,
  restrictTo(UserType.STAFF),
  validate(registerGuest),
  authController.registerGuest,
);

/** 
 * @route   POST /api/v1/internal/auth/refresh-token
 * @desc    Lấy Access Token mới từ Refresh Token trong Cookie
 */
authRouter.post("/refresh-token", authController.refresh);

export default authRouter;