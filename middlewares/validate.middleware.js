// middlewares/validate.middleware.js
export const validateData =
  (schema = {}) =>
  (req, res, next) => {
    try {
      // 1. Validate Body
      if (schema.body) {
        schema.body.parse(req.body);
      }

      // 2. Validate Params (VD: /users/:id)
      if (schema.params) {
        schema.params.parse(req.params);
      }

      // 3. Validate Query (VD: ?page=1)
      if (schema.query) {
        schema.query.parse(req.query);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
