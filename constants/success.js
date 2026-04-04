export const SUCCESS_STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
};

export const SUCCESS_MESSAGES = {
  [SUCCESS_STATUS_CODE.OK]: "The request is OK",
  [SUCCESS_STATUS_CODE.CREATED]:
    "The request has been fulfilled, and a new resource is created",
  [SUCCESS_STATUS_CODE.ACCEPTED]:
    "The request has been accepted for processing, but processing is not completed",
  [SUCCESS_STATUS_CODE.NON_AUTHORITATIVE]:
    "The request has been processed, but returning information from another source",
  [SUCCESS_STATUS_CODE.NO_CONTENT]:
    "The request has been processed, but is not returning any content",
  [SUCCESS_STATUS_CODE.RESET_CONTENT]:
    "The request has been processed, requires requester to reset document view",
  [SUCCESS_STATUS_CODE.PARTIAL_CONTENT]:
    "The server is delivering only part of the resource due to a range header",
  LOGIN_SUCCES: "Đăng nhập thành công",
  LOUGOUT: "Đăng xuất thành công",
  RENEW_TOKEN: "Làm mới token thành công",
};
