import { ERROR_MESSAGES } from "../constants/errorMessages.js";

class HttpException extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
  }
}

// Helper function để tạo nhanh các class lỗi
const createException = (name, statusCode, defaultMessage) => {
  return class extends HttpException {
    constructor(message = defaultMessage) {
      super(message, statusCode);
      this.name = name;
    }
  };
};

export const BadRequestException = createException(
  "BadRequest",
  400,
  ERROR_MESSAGES.BAD_REQUEST,
);
export const UnauthorizedException = createException(
  "Unauthorized",
  401,
  ERROR_MESSAGES.UNAUTHORIZED,
);
export const ForbiddenException = createException(
  "Forbidden",
  403,
  ERROR_MESSAGES.FORBIDDEN,
);
export const NotFoundException = createException(
  "NotFound",
  404,
  ERROR_MESSAGES.NOT_FOUND,
);
export const ConflictException = createException(
  "Conflict",
  409,
  ERROR_MESSAGES.CONFLICT,
);
export const UnprocessableEntityException = createException(
  "UnprocessableEntity",
  422,
  "Dữ liệu không xử lý được.",
);
export const InternalServerErrorException = createException(
  "InternalServer",
  500,
  ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
);
export const ImATeapotException = createException(
  "ImATeapot",
  418,
  ERROR_MESSAGES.IM_A_TEAPOT,
);
