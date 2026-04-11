import { BaseController } from "./base.controller.js";
import { orderService } from "../services/order.service.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";
import { createOrderSchema as inputCreateOrderSchema } from "../contracts/input/order.schema.js";
import { OrderMapper } from "../mappers/order.mapper.js";

class OrderController extends BaseController {
  constructor() {
    super(orderService);
  }

  create = asyncHandler(async (req, res) => {
    const body = inputCreateOrderSchema.body.parse(req.body);

    const result = await this.service.create(body);
    const formatted = OrderMapper.toCreateResponse(result);

    return this.success(res, {
      statusCode: SUCCESS_STATUS_CODE.CREATED,
      message: SUCCESS_MESSAGES[SUCCESS_STATUS_CODE.CREATED],
      data: formatted,
    });
  });
}

export const orderController = new OrderController();
