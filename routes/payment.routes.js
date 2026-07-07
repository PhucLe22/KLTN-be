import express from "express";
import { paymentController } from "../controllers/payment.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/authentication.middleware.js";
import { createVnpayPayment } from "../contracts/input/payment.schema.js";
import { prisma } from "../lib/prisma.js";

const paymentRouter = express.Router();

paymentRouter.post(
  "/vnpay/create",
  protect,
  validate(createVnpayPayment),
  paymentController.createVnpayPayment,
);

paymentRouter.get(
  "/vnpay/return",
  paymentController.vnpayReturn,
);

paymentRouter.get(
  "/vnpay/ipn",
  paymentController.vnpayIpn,
);

paymentRouter.post(
  "/query-dr",
  protect,
  paymentController.queryDr,
);

paymentRouter.post(
  "/refund",
  protect,
  paymentController.refund,
);

paymentRouter.get(
  "/order/:orderId",
  protect,
  paymentController.getPaymentByOrderId,
);

export default paymentRouter;
