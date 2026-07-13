import pkg from "@prisma/client";
const { Prisma } = pkg;
import { ZodError } from "zod";
import { ERR } from "../lib/httpExceptions.js";
import { ERROR_MESSAGES } from "../constants/errors.js";
import logger from "../lib/logger.js";

export const notFound = (req, res, next) => {
  throw ERR.NotFound(`Not Found - ${req.originalUrl}`);
};

export const errorHandler = (
  err,
  req,
  res,
  next,
) => {
  let error = normalizeError(err);

  if (!error?.statusCode) {
    error = ERR.InternalServerError(
      error?.message,
    );
  }

  logger.error({
    method: req.method,
    url: req.originalUrl,
    message: error.message,
    stack: error.stack,
  });

  return res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    errors: error.errors ?? null,

    ...(process.env.NODE_ENV ===
      "development" && {
      stack: error.stack,
    }),
  });
};



// lib for err
const prismaErrorMap = {
  P2002: (err) =>
    ERR.Conflict(
      `${err.meta?.target ?? "Dữ liệu"} đã tồn tại.`,
    ),

  P2025: () => ERR.NotFound(),

  P2003: () =>
    ERR.BadRequest(
      "Dữ liệu liên quan không tồn tại.",
    ),

  P2028: () =>
    ERR.InternalServerError(
      "Giao dịch không thành công, vui lòng thử lại.",
    ),
};

export const normalizeError = (err) => {
  if (err instanceof ZodError) {
    return ERR.BadRequest(
      ERROR_MESSAGES.VALIDATION_ERROR,
      Object.fromEntries(
        err.issues.map((issue) => [
          issue.path.join("."),
          issue.message,
        ]),
      ),
    );
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError
  ) {
    return (
      prismaErrorMap[err.code]?.(err) ??
      ERR.InternalServerError(
        `Lỗi dữ liệu: ${err.code}`,
      )
    );
  }

  return err;
};