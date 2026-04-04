// middlewares/validate.middleware.js
export const validateData =
  (schema = {}) =>
  (req, res, next) => {
    try {
      // 1. Kiểm tra Body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // 2. Kiểm tra Params (VD: /users/:id)
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      // 3. Kiểm tra Query (VD: ?page=1)
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
