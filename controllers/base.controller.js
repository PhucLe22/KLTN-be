import { SUCCESS_STATUS_CODE } from "../constants/success.js";
import { ERROR_STATUS_CODE, ERROR_MESSAGES } from "../constants/errors.js";

export class BaseController {
  constructor(service) {
    this.service = service;
  }

  success(
    res,
    {
      message = "Thao tác thành công",
      data = null,
      statusCode = SUCCESS_STATUS_CODE.OK,
      meta = null,
    } = {}, // Default là object rỗng để tránh lỗi nếu không truyền gì
  ) {
    const response = {
      success: true,
      message,
      data,
    };

    if (meta) response.meta = meta;

    return res.status(statusCode).json(response);
  }

  error(
    res,
    {
      message = ERROR_MESSAGES[ERROR_STATUS_CODE.INTERNAL_SERVER_ERROR],
      statusCode = ERROR_STATUS_CODE.INTERNAL_SERVER_ERROR,
      errors = null,
    } = {},
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  noContent(res) {
    return res.status(SUCCESS_STATUS_CODE.NO_CONTENT).send();
  }
}
