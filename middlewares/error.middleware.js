import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from "../lib/httpExceptions.js";
import { ERROR_MESSAGES } from "../constants/errors.js";
import logger from "../lib/logger.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // 1. Xử lý lỗi từ ZOD (Validation) - Trích xuất chi tiết từng field
  if (err instanceof ZodError) {
    const fieldErrors = {};

    // Zod sử dụng .issues là chuẩn nhất
    const issues = err.issues || err.errors || [];

    // Log ra bảng cực đẹp trong Terminal khi dev
    if (process.env.NODE_ENV === "development" && issues.length > 0) {
      console.log("\n❌ [ZOD VALIDATION ERROR]");
      console.table(
        issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
          code: i.code,
        })),
      );
    }

    issues.forEach((issue) => {
      const path = issue.path.join(".");
      fieldErrors[path] = issue.message;
    });

    // Tạo object error chuẩn để trả về
    error = {
      statusCode: 400,
      status: "fail",
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors: fieldErrors,
      stack: err.stack, // Giữ lại stack gốc để debug nếu cần
    };
  }

  // 2. Xử lý lỗi từ PRISMA (Database)
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        const target = err.meta?.target || "dữ liệu";
        error = new ConflictException(`${target} đã tồn tại trên hệ thống.`);
        break;
      case "P2025":
        error = new NotFoundException("Không tìm thấy bản ghi yêu cầu.");
        break;
      case "P2003":
        error = new BadRequestException(
          "Dữ liệu liên quan không tồn tại (Lỗi khóa ngoại).",
        );
        break;
      default:
        error = new InternalServerErrorException(`Lỗi Database: ${err.code}`);
    }
  }

  // 3. Nếu vẫn chưa có statusCode (lỗi code, lỗi runtime lạ)
  if (!error.statusCode) {
    error = new InternalServerErrorException(
      err.message || "Lỗi hệ thống không xác định",
    );
  }

  // --- PHẢN HỒI CHO CLIENT ---
  const statusCode = error.statusCode || 500;
  const status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    console.error("🔥 ERROR:", err);
  }
  logger.error(`${req.method} ${req.url} - ${error.message}`);

  res.status(statusCode).json({
    status,
    message: error.message,
    // Trả về object errors chi tiết nếu có (Frontend sẽ rất thích cái này)
    errors: error.errors || null,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      originalError: err,
    }),
  });
};
