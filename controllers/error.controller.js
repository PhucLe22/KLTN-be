import { ZodError } from "zod";

export class HttpException extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

const createException = (statusCode, defaultMsg) =>
  class extends HttpException {
    constructor(message = defaultMsg) {
      super(message, statusCode);
    }
  };

export const BadRequestException = createException(400, "Bad request");
export const UnauthorizedException = createException(401, "Unauthorized");
export const ForbiddenException = createException(403, "Forbidden");
export const NotFoundException = createException(404, "Not found");
export const ConflictException = createException(409, "Conflict");
export const InternalServerErrorException = createException(500, "Internal server error");

export function exceptionFilter(err, req, res, next) {
  const statusCode = err instanceof ZodError ? 400 : err.statusCode || 500;
  const message =
    err instanceof ZodError
      ? err.issues.map((i) => ({ path: i.path.join(".") || "(unknown)", message: i.message }))
      : err instanceof HttpException
        ? err.message
        : "Internal server error";

  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
}
