import { paymentService } from "../services/payment.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { ERR } from "../lib/httpExceptions.js";
import { prisma } from "../lib/prisma.js";

class PaymentController {
  createVnpayPayment = asyncHandler(async (req, res) => {
    const { orderId, returnUrl } = req.body;
    const ipAddr = paymentService.getClientIp(req);

    const result = await paymentService.createVnpayPayment(orderId, ipAddr, returnUrl);

    return res.ok(result);
  });

  vnpayReturn = asyncHandler(async (req, res) => {
    const result = paymentService.verifyReturnUrl(req.query);

    return res.json({
      success: true,
      data: result,
    });
  });

  vnpayIpn = asyncHandler(async (req, res) => {
    const ipnResult = await paymentService.processIpn(req.query);

    return res.json(ipnResult);
  });

  queryDr = asyncHandler(async (req, res) => {
    const { vnpTxnRef, vnpTransactionDate } = req.body;
    const result = await paymentService.queryDr(vnpTxnRef, vnpTransactionDate);

    return res.ok(result);
  });

  refund = asyncHandler(async (req, res) => {
    const { paymentId, amount, reason } = req.body;
    const result = await paymentService.refund(paymentId, amount, reason);

    return res.ok(result);
  });

  getPaymentByOrderId = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return res.ok(payments);
  });
}

export const paymentController = new PaymentController();
