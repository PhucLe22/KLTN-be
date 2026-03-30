import express from "express";
import { BadRequestException } from "../lib/httpExceptions.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running smoothly" });
});

// 1. Test lỗi 400 (Manual throw)
router.get("/test-error", (req, res) => {
  throw new BadRequestException("Đây là lỗi 400 được quăng thủ công để test!");
});

// 2. Test lỗi bất đồng bộ (Async error)
router.get("/test-async-error", asyncHandler(async (req, res) => {
  // Giả lập một lỗi xảy ra trong hàm async (ví dụ: truy vấn DB lỗi)
  throw new Error("Lỗi xảy ra trong quá trình xử lý bất đồng bộ!");
}));

// 3. Test lỗi 500 (Unhandled error)
router.get("/test-internal-error", (req, res) => {
  const obj = {};
  // Cố tình truy cập thuộc tính của undefined để gây ra TypeError
  return obj.user.name; 
});

export default router;
