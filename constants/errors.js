export const ERROR_STATUS_CODE = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  IM_A_TEAPOT: 418,
};

export const ERROR_MESSAGES = {
  [ERROR_STATUS_CODE.BAD_REQUEST]: "Yêu cầu không hợp lệ.",
  [ERROR_STATUS_CODE.UNAUTHORIZED]:
    "Bạn cần đăng nhập để thực hiện hành động này.",
  [ERROR_STATUS_CODE.FORBIDDEN]: "Bạn không có quyền truy cập tài nguyên này.",
  [ERROR_STATUS_CODE.NOT_FOUND]: "Không tìm thấy tài nguyên yêu cầu.",
  [ERROR_STATUS_CODE.CONFLICT]: "Dữ liệu đã tồn tại trong hệ thống.",
  [ERROR_STATUS_CODE.UNPROCESSABLE_ENTITY]: "Dữ liệu không thể xử lý được.",
  [ERROR_STATUS_CODE.INTERNAL_SERVER_ERROR]: "Lỗi hệ thống máy chủ.",
  [ERROR_STATUS_CODE.IM_A_TEAPOT]: "Tôi là một chiếc ấm trà!",
  AUTH_INVALID: "Email, số điện thoại hoặc mật khẩu không chính xác.",
  AUTH_TOKEN_INVALID: "Token không hợp lệ hoặc đã bị thu hồi.",
  AUTH_TOKEN_EXPIRED: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
  VALIDATION_ERROR: "Dữ liệu không đúng định dạng Schema.",
};
