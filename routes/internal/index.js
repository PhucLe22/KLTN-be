import express from "express";
import orderRouter from "./order.routes.js";
import authRouter from "./auth.routes.js";
import adminRouter from "./admin/index.js";
import productRouter from "./product.routes.js";
import optionGroupRouter from "./option-group.routes.js";
import voucherRouter from "./voucher.routes.js";
import kitchenRouter from "./kitchen.routes.js";
import customerRouter from "./customer.routes.js";
import { authController } from "../../controllers/auth.controller.js";
import { protect } from "../../middlewares/authentication.middleware.js";

const internalRouter = express.Router();

// Mount staff order routes
internalRouter.use("/orders",orderRouter);
internalRouter.use("/auth", authRouter);
internalRouter.use("/admin", adminRouter);
internalRouter.use("/products", productRouter);
internalRouter.use("/option-groups", optionGroupRouter);
internalRouter.use("/vouchers", voucherRouter);
internalRouter.use("/kitchen", kitchenRouter);
internalRouter.use("/customers", customerRouter);

/**
 * @route   GET /api/v1/internal/profile
 * @desc    Lấy thông tin profile của staff/admin đang đăng nhập
 * @access  Private (Cần Access Token)
 */
internalRouter.get("/profile", protect, authController.getProfile);

export default internalRouter;