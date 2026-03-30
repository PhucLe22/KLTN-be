import { z } from "zod";

export const registerSchema = {
  body: z.object({
    email: z.email("Email không hợp lệ").trim().toLowerCase(),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại phải có 10 số"),
    name: z.string().min(2, "Tên quá ngắn").trim(),
  }),
};

export const loginSchema = {
  body: z.object({
    // Đăng nhập linh hoạt bằng email hoặc phone
    login: z.string().min(1, "Vui lòng nhập Email hoặc Số điện thoại"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  }),
};
