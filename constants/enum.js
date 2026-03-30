export const OrderType = {
  DINE_IN: "DINE_IN",
  TAKEAWAY: "TAKEAWAY",
  DELIVERY: "DELIVERY",
};

export const OrderStatus = {
  NEW: "NEW",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  READY: "READY",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
};

export const PaymentMethod = {
  CASH: "CASH",
  CARD: "CARD",
  MOMO: "MOMO",
  VNPAY: "VNPAY",
  BANK_TRANSFER: "BANK_TRANSFER",
};

export const PaymentStatus = {
  PENDING: "PENDING", // tạo payment record nhưng chưa xác nhận
  SUCCESS: "SUCCESS", // thanh toán thành công
  FAILED: "FAILED", // thanh toán thất bại
  REFUNDED: "REFUNDED", // đã hoàn tiền (full hoặc partial)
};

export const StaffRole = {
  MANAGER: "MANAGER",
  CASHIER: "CASHIER",
  KITCHEN: "KITCHEN",
  OWNER: "OWNER",
};

export const DeliveryStatus = {
  PENDING: "PENDING",
  SHIPPER_ASSIGNED: "SHIPPER_ASSIGNED",
  PICKED_UP: "PICKED_UP",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
};

export const PointType = {
  EARN: "EARN",
  REDEEM: "REDEEM",
  EXPIRE: "EXPIRE",
  ADJUST: "ADJUST",
};

export const DiscountType = {
  PERCENT: "PERCENT",
  FIXED: "FIXED",
};

export const CustomerTier = {
  BRONZE: "BRONZE", // Thành viên cơ bản (mặc định)
  SILVER: "SILVER", // Hạng trung
  GOLD: "GOLD", // Hạng cao
  PLATINUM: "PLATINUM", // Hạng cao nhất
};

export const AuditAction = {
  CREATE: "CREATE", // Tạo mới record
  UPDATE: "UPDATE", // Cập nhật dữ liệu (không phải status)
  DELETE: "DELETE", // Xóa (soft/hard)
  STATUS_CHANGE: "STATUS_CHANGE", // Thay đổi trạng thái (OrderStatus, PaymentStatus...)
  LOGIN: "LOGIN", // User đăng nhập
  LOGOUT: "LOGOUT", // User đăng xuất
  PERMISSION_CHANGE: "PERMISSION_CHANGE", // Thay đổi role / quyền
};

export const VoucherScope = {
  PUBLIC: "PUBLIC", // Toàn sàn – ai cũng dùng được
  CUSTOMER: "CUSTOMER", // Chỉ khách được gán mới dùng được
};

export const ProductType = {
  SIMPLE: "SIMPLE", // sản phẩm thường
  COMBO: "COMBO", // combo nhiều sản phẩm
  SERVICE: "SERVICE", // phí dịch vụ
};
