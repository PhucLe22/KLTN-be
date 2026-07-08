import { ERROR_MESSAGES, ERROR_STATUS_CODE } from "../constants/errors.js";

export class HttpException extends Error {
  constructor(statusCode, message, errors = null) {
    super(
      message ??
      ERROR_MESSAGES[statusCode] ??
      "An unexpected error occurred",
    );

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = statusCode < 500 ? "fail" : "error";
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

const createError = (statusCode) => {
  return (message, errors) =>
    new HttpException(statusCode, message, errors);
};

export const ERR = Object.freeze({
  BadRequest: createError(ERROR_STATUS_CODE.BAD_REQUEST),
  Unauthorized: createError(ERROR_STATUS_CODE.UNAUTHORIZED),
  Forbidden: createError(ERROR_STATUS_CODE.FORBIDDEN),
  NotFound: createError(ERROR_STATUS_CODE.NOT_FOUND),
  Conflict: createError(ERROR_STATUS_CODE.CONFLICT),
  InternalServerError: createError(
    ERROR_STATUS_CODE.INTERNAL_SERVER_ERROR,
  ),
});