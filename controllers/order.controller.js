import { BaseController } from "./base.controller.js";
import { orderService } from "../services/order.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";
import { OrderMapper } from "../mappers/order.mapper.js";

class OrderController extends BaseController {
  constructor() {
    super(orderService);
  }

  create = asyncHandler(async (req, res) => {
    const result = await this.service.create(req.body);
    const formatted = OrderMapper.toCreateResponse(result);

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.CREATED,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.CREATED],
      data: formatted,
    });
  });

  getOrderCode = asyncHandler(async (req, res) => {
    const { orderCode } = req.params;
    const result = await this.service.findByOrderCode(orderCode);
    const formatted = OrderMapper.toGetOrderCodeResponse(result);

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.OK,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
      data: formatted,
    });
  });

  getOrderHistory = asyncHandler(async (req, res) => {
    const { storeId } = req.query;
    const query = req.query;
    const result = await this.service.getOrderHistory(storeId, query, req.user.staff);
    const formatted = OrderMapper.toGetOrderHistoryResponse(result);

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.OK,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
      data: formatted.items,
      meta: formatted.meta,
    });
  });
}

export const orderController = new OrderController();
