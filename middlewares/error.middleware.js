import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from "../lib/httpExceptions.js";
import logger from "../lib/logger.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // 1. Xử lý lỗi từ ZOD (Validation) - Trích xuất chi tiết từng field
  if (err instanceof ZodError) {
    const fieldErrors = {};
    err.errors.forEach((e) => {
      // Lấy path (ví dụ: body.email -> email)
      const path = e.path.length > 1 ? e.path.slice(1).join(".") : e.path[0];
      fieldErrors[path] = e.message;
    });

    // Tạo Exception mới kèm theo object chi tiết lỗi các field
    error = new BadRequestException("Dữ liệu nhập vào không hợp lệ");
    error.errors = fieldErrors; // Gán thêm property errors vào object error
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
  logger.error(`${req.method} ${req.url} - ${err.message}`);

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
