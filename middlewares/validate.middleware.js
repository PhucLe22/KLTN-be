export const validate =
  (schema = {}) =>
  (req, res, next) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.params) {
        Object.assign(req.params, schema.params.parse(req.params));
      }
      if (schema.query) {
        Object.assign(req.query, schema.query.parse(req.query));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
