import express from "express";
import { orderController } from "../controllers/order.controller.js";

const orderRouter = express.Router();

/**
 * @route   POST /api/v1/orders
 * @desc    Tạo đơn hàng mới
 * @access  Public (có thể thêm auth middleware sau)
 */
orderRouter.post("/", orderController.create);

export default orderRouter;
