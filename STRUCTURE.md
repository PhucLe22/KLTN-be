# Cấu trúc Thư mục Dự án (Project Structure)

Tài liệu này mô tả chi tiết nhiệm vụ và trách nhiệm của từng thư mục trong dự án Backend (Node.js + Prisma).

## 1. `/config`

- **Nhiệm vụ:** Chứa các tệp cấu hình hệ thống.
- **Chi tiết:** Kết nối cơ sở dữ liệu (`connectToDB.js`), cấu hình các dịch vụ bên thứ ba (nếu có).

## 2. `/constants`

- **Nhiệm vụ:** Lưu trữ các hằng số dùng chung toàn hệ thống.
- **Chi tiết:**
  - `enum.js`: Định nghĩa các kiểu liệt kê (ví dụ: Trạng thái đơn hàng, Vai trò người dùng).
  - `errorMessages.js`: Tập trung các thông báo lỗi để dễ dàng quản lý và đa ngôn ngữ hóa.

## 3. `/contracts`

- **Nhiệm vụ:** Định nghĩa "giao kèo" dữ liệu giữa Client và Server.
- **Chi tiết:** Chứa các Schema (thường là Zod ) để validate dữ liệu đầu vào (Request Body/Query/Params). Có phân chia theo quyền hạn như `admin/` và `staff/`.

## 4. `/controllers`

- **Nhiệm vụ:** Tiếp nhận Request từ Route, điều phối logic và trả về Response.
- **Chi tiết:** Controller không nên chứa logic nghiệp vụ phức tạp mà chỉ đóng vai trò "người vận chuyển", gọi đến các Service tương ứng.

## 5. `/lib` (Libraries/Utilities)

- **Nhiệm vụ:** Chứa các công cụ hỗ trợ, hàm tiện ích hoặc cấu hình các thư viện cốt lõi.
- **Chi tiết:**
  - `asyncHandler.js`: Bắt lỗi cho các hàm async.
  - `jwt.js`: Xử lý mã hóa/giải mã Token.
  - `prisma.js`: Khởi tạo và quản lý instance của Prisma Client.
  - `httpExceptions.js` & `successResponse.js`: Chuẩn hóa định dạng phản hồi API.

## 6. `/middlewares`

- **Nhiệm vụ:** Các hàm trung gian xử lý logic trước khi Request đến được Controller.
- **Chi tiết:** Kiểm tra quyền truy cập (`authentication`, `authorize`), Validate dữ liệu (`validate`), và xử lý lỗi tập trung (`error`).

## 7. `/prisma`

- **Nhiệm vụ:** Quản lý Cơ sở dữ liệu thông qua Prisma ORM.
- **Chi tiết:** Tệp `schema.prisma` định nghĩa các Model, quan hệ giữa các bảng và cấu hình Database.

## 8. `/repositories`

- **Nhiệm vụ:** Tầng truy xuất dữ liệu (Data Access Layer).
- **Chi tiết:** Chứa các câu lệnh truy vấn trực tiếp vào Database (thông qua Prisma). Tầng này giúp tách biệt logic truy vấn khỏi logic nghiệp vụ.

## 9. `/routes`

- **Nhiệm vụ:** Định nghĩa các Endpoints (đường dẫn) của API.
- **Chi tiết:** Kết nối các URL với các Controller và Middleware tương ứng.

## 10. `/services`

- **Nhiệm vụ:** Tầng xử lý nghiệp vụ chính (Business Logic Layer).
- **Chi tiết:** Đây là nơi chứa các logic tính toán, xử lý dữ liệu phức tạp. Service sẽ gọi đến Repository để lấy dữ liệu và trả kết quả về cho Controller.

---

## Các tệp tại thư mục gốc:

- `server.js`: Điểm khởi đầu của ứng dụng (Entry point).
- `.env`: Lưu trữ biến môi trường (Secrets, DB URL).
- `prisma.config.ts`: Cấu hình bổ sung cho Prisma.
