class ResponseHandler {
  // success
  success(res, data = null, message = "Success", status = 200) {
    res.status(status).json({
      success: true,
      message,
      data,
    });
  }

  // paginated data
  paginated(res, data, page = 1, limit = 10, total = 0, message = "Success") {
    res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
}

export default new ResponseHandler();