import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";

class SuccessResponse {
  constructor({ message, data, metadata = {}, status = "success" }) {
    this.status = status;
    this.message = message;
    this.data = data;

    if (metadata && Object.keys(metadata).length > 0) {
      this.metadata = metadata;
    }
  }

  send(res, statusCode = SUCCESS_STATUS_CODE.OK) {
    const finalMessage =
      this.message || SUCCESS_MESSAGES[SUCCESS_STATUS_CODE] || "Success";

    return res.status(statusCode).json({
      status: this.status,
      statusCode: statusCode,
      message: finalMessage,
      data: this.data,
      ...(this.metadata ? { metadata: this.metadata } : {}),
    });
  }
}

/**
 * Helper cho phản hồi 200 OK
 */
export const OK = (res, data, message, metadata) => {
  return new SuccessResponse({ message, data, metadata }).send(
    res,
    SUCCESS_STATUS_CODE.OK,
  );
};

/**
 * Helper cho phản hồi 201 Created
 */
export const CREATED = (res, data, message, metadata) => {
  return new SuccessResponse({ message, data, metadata }).send(
    res,
    SUCCESS_STATUS_CODE.CREATED,
  );
};

/**
 * Helper cho phản hồi 204 No Content
 */
export const NO_CONTENT = (res, message, metadata) => {
  return new SuccessResponse({ message, data: null, metadata }).send(
    res,
    SUCCESS_STATUS_CODE.NO_CONTENT,
  );
};

// Ông có thể export thêm các helper khác như ACCEPTED, PARTIAL_CONTENT nếu cần
