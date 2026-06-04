import { BaseController } from "./base.controller.js";
import { orderService } from "../services/order.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";
import { OrderMapper } from "../mappers/order.mapper.js";
class OrderController extends BaseController {
  constructor() {
    super(orderService);
  }
  createOrder = asyncHandler(async (req, res) => {
    const result = await this.service.createOrder(req.body, req.user);
    console.log("Result", result);
    const formatted = OrderMapper.toCreateResponse(result);

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.CREATED,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.CREATED],
      data: formatted,
    });
  });

  createOrderForStaff = asyncHandler(async (req, res) => {
    const staffStoreId = req.user?.staff?.storeId;
    const result = await this.service.createOrderForStaff(staffStoreId, req.body, req.user);
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

  getOrders = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const result = await this.service.getOrders(userId, req.query);
    const formatted = OrderMapper.toGetOrderResponse(result);

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.OK,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
      data: formatted.items,
      meta: formatted.meta,
    });
  });

  /**
   * Get orders for staff (filter by store)
   * Query params: status, type, page, limit
   */
  getOrderForStaff = asyncHandler(async (req, res) => {
    const staffStoreId = req.user?.staff?.storeId;
    const result = await this.service.getOrdersForStaff(staffStoreId, req.query);
    const formatted = OrderMapper.toGetOrderResponse(result);

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.OK,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
      data: formatted.items,
      meta: formatted.meta,
    });
  });

  updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const result = await this.service.updateStatus(id, status, req.user);
    const formatted = OrderMapper.toCreateResponse(result); // Using toCreateResponse as it includes relations

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.OK,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.OK],
      data: formatted,
    });
  });

  confirmOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.service.updateStatus(id, "CONFIRMED", req.user);
    const formatted = OrderMapper.toCreateResponse(result);

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.OK,
      message: "Order confirmed successfully",
      data: formatted,
    });
  });

  startPreparing = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.service.updateStatus(id, "PREPARING", req.user);
    const formatted = OrderMapper.toCreateResponse(result);

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.OK,
      message: "Order is now being prepared",
      data: formatted,
    });
  });
}

export const orderController = new OrderController();
