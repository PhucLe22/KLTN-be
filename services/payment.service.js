import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat, getDateInGMT7, generateRandomString, VnpTransactionType, IpnSuccess, IpnFailChecksum, IpnOrderNotFound, IpnInvalidAmount, InpOrderAlreadyConfirmed, IpnUnknownError } from 'vnpay';
import { prisma } from '../lib/prisma.js';
import { PaymentMethod, PaymentStatus } from '../constants/enum.js';
import { ERR } from '../lib/httpExceptions.js';
import { ERROR_MESSAGES } from '../constants/errors.js';

class PaymentService {
  constructor() {
    if (!process.env.VNP_TMNCODE || !process.env.VNP_SECURE_SECRET) {
      console.warn('[PaymentService] VNP_TMNCODE or VNP_SECURE_SECRET not set. VNPay will not work.');
    }

    this.vnpay = new VNPay({
      tmnCode: process.env.VNP_TMNCODE || '',
      secureSecret: process.env.VNP_SECURE_SECRET || '',
      vnpayHost: process.env.VNP_HOST || 'https://sandbox.vnpayment.vn',
      testMode: true,
      hashAlgorithm: 'SHA512',
      enableLog: true,
      loggerFn: ignoreLogger,
    });
  }

  getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.socket?.remoteAddress
      || req.ip
      || '127.0.0.1';
  }

  async createVnpayPayment(orderId, ipAddr, returnUrl) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) throw ERR.NotFound(ERROR_MESSAGES.ORDER_NOT_FOUND);

    const existingPending = order.payments.find(
      p => p.method === PaymentMethod.VNPAY && p.status === PaymentStatus.PENDING
    );
    if (existingPending) {
      throw ERR.BadRequest('Đã có yêu cầu thanh toán VNPay đang chờ xử lý cho đơn hàng này');
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: order.total,
        method: PaymentMethod.VNPAY,
        status: PaymentStatus.PENDING,
      },
    });

    const paymentUrl = this.vnpay.buildPaymentUrl({
      vnp_Amount: Number(order.total),
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: payment.id,
      vnp_OrderInfo: `Thanh toan don hang ${order.orderCode}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: returnUrl,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
    });

    return { payment, paymentUrl };
  }

  verifyIpnCall(query) {
    return this.vnpay.verifyIpnCall(query);
  }

  verifyReturnUrl(query) {
    return this.vnpay.verifyReturnUrl(query);
  }

  async processIpn(query) {
    let verify;
    try {
      verify = this.vnpay.verifyIpnCall(query);
    } catch {
      return IpnFailChecksum;
    }

    if (!verify.isVerified) {
      return IpnFailChecksum;
    }

    if (!verify.isSuccess) {
      return IpnUnknownError;
    }

    const paymentId = verify.vnp_TxnRef;
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      return IpnOrderNotFound;
    }

    if (Number(verify.vnp_Amount) !== Number(payment.amount)) {
      return IpnInvalidAmount;
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return InpOrderAlreadyConfirmed;
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.SUCCESS,
          providerRef: String(verify.vnp_TransactionNo || ''),
          paidAt: new Date(),
        },
      });
    });

    return IpnSuccess;
  }

  async queryDr(vnpTxnRef, vnpTransactionDate) {
    const date = dateFormat(getDateInGMT7(new Date()));
    return this.vnpay.queryDr({
      vnp_RequestId: generateRandomString(16),
      vnp_IpAddr: '127.0.0.1',
      vnp_TxnRef: vnpTxnRef,
      vnp_TransactionDate: vnpTransactionDate,
      vnp_OrderInfo: 'Query transaction',
      vnp_CreateDate: date,
    });
  }

  async refund(paymentId, amount, reason) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) throw ERR.NotFound('Payment not found');
    if (payment.status !== PaymentStatus.SUCCESS) throw ERR.BadRequest('Payment is not successful');

    const refundRequestDate = dateFormat(getDateInGMT7(new Date()));

    const result = await this.vnpay.refund({
      vnp_Amount: amount,
      vnp_CreateBy: 'admin',
      vnp_CreateDate: refundRequestDate,
      vnp_IpAddr: '127.0.0.1',
      vnp_OrderInfo: reason || `Refund for payment ${paymentId}`,
      vnp_RequestId: `RF${Date.now()}`,
      vnp_TransactionDate: refundRequestDate,
      vnp_TransactionType: VnpTransactionType.FULL_REFUND,
      vnp_TxnRef: payment.order.orderCode,
      vnp_TransactionNo: Number(payment.providerRef) || undefined,
      vnp_Locale: VnpLocale.EN,
    });

    if (result.isVerified && result.isSuccess) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.REFUNDED },
        });

        await tx.refund.create({
          data: {
            paymentId,
            amount,
            reason: reason || null,
          },
        });
      });
    }

    return result;
  }
}

export const paymentService = new PaymentService();
