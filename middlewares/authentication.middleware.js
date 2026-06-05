import { JwtHelper } from "../lib/jwt.js";
import { ERR } from "../lib/httpExceptions.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { userRepository } from "../repositories/user.repository.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Kiểm tra Token có trong Header Authorization không
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw ERR.Unauthorized(
      "Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập.",
    );
  }

  // 2. Verify Token (Kiểm tra chữ ký và hạn sử dụng)
  // Nếu token fake hoặc hết hạn, JwtHelper.verifyAccessToken sẽ tự throw lỗi
  const decoded = JwtHelper.verifyAccessToken(token);

  // 3. Kiểm tra User còn tồn tại trong Database không
  // const currentUser = await userRepository.findById(decoded.sub);
  // if (!currentUser) {
  //   throw ERR.Unauthorized(
  //     "Người dùng sở hữu token này không còn tồn tại.",
  //   );
  // }

  // 4. Kiểm tra tài khoản có bị khóa (isActive) không
  // if (!currentUser.isActive) {
  //   throw ERR.Forbidden("Tài khoản của bạn đã bị khóa.");
  // }

  // 5. Gán thông tin user vào request để các Controller/Middleware sau sử dụng
  // Ông có thể gán toàn bộ user hoặc chỉ id/role tùy nhu cầu
  // req.user = currentUser;

  // 6. Gán staff info từ JWT claims để restrictTo middleware có thể kiểm tra role
  if (decoded.role && decoded.sid) {
    req.user.staff = {
      id: decoded.sid,
      role: decoded.role,
      storeId: decoded.storeId,
    };
  }

  next();
});
