import { SUCCESS_MESSAGES, SUCCESS_STATUS_CODE } from "../constants/success.js";

export const responseEnhancer = (req, res, next) => {
  // truyền cái nào nhận cái đó, nếu muốn auto thì tuyền null
  res.ok = (data = null, meta = null, message = null, code = null) => {
    let statusCode = 200;

    if (data === null || data === undefined) {
      return res.status(SUCCESS_STATUS_CODE.NO_CONTENT).send();
    }

    switch (req.method) {
      case 'POST':
        statusCode = SUCCESS_STATUS_CODE.CREATED;
        break;
      case 'DELETE':
        statusCode = SUCCESS_STATUS_CODE.NO_CONTENT;
        break;
      default:
        statusCode = SUCCESS_STATUS_CODE.OK;
    }

    statusCode = code ?? statusCode

    if (typeof meta === 'string') {
      message = meta;
      meta = null;
    }

    const response = {
      success: true,
      message: message || SUCCESS_MESSAGES[statusCode] || 'Succeed',
      // ...(data && { data }),
      data,
      ...(meta && { meta })
    };

    return res.status(statusCode).json(response);
  };
  next();
};



