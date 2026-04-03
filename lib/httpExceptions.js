import { ERROR_MESSAGES, ERROR_STATUS_CODE } from "../constants/errors.js";
class HttpException extends Error {
  constructor(statusCode, message) {
    // Nếu không có message, tìm trong từ điển theo statusCode
    const finalMessage =
      message || ERROR_MESSAGES[statusCode] || "An unexpected error occurred";
    super(finalMessage);

    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Helper tạo Exception
const createException = (statusCode) => {
  return class extends HttpException {
    constructor(message) {
      super(statusCode, message);
    }
  };
};

export const BadRequestException = createException(
  ERROR_STATUS_CODE.BAD_REQUEST,
);
export const UnauthorizedException = createException(
  ERROR_STATUS_CODE.UNAUTHORIZED,
);
export const ForbiddenException = createException(ERROR_STATUS_CODE.FORBIDDEN);
export const NotFoundException = createException(ERROR_STATUS_CODE.NOT_FOUND);
export const ConflictException = createException(ERROR_STATUS_CODE.CONFLICT);
export const InternalServerErrorException = createException(
  ERROR_STATUS_CODE.INTERNAL_SERVER_ERROR,
);
