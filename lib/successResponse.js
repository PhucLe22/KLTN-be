class SuccessResponse {
  constructor(data, metadata = {}) {
    this.status = "success";
    this.data = data;
    if (Object.keys(metadata).length > 0) {
      this.metadata = metadata;
    }
  }

  send(res, statusCode = 200) {
    return res.status(statusCode).json(this);
  }
}

// Helper cho các trường hợp cụ thể
export const OK = (res, data, metadata) => {
  return new SuccessResponse(data, metadata).send(res, 200);
};

export const CREATED = (res, data, metadata) => {
  return new SuccessResponse(data, metadata).send(res, 201);
};
