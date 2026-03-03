class RequestHandler {
  pagination(query) {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 100);
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  sorting(query, allowedFields = []) {
    const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : "createdAt";
    const order = query.order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    return [[sortBy, order]];
  }

  filtering(query, allowedFields = []) {
    const where = {};

    for (const field of allowedFields) {
      if (query[field] !== undefined) where[field] = query[field];
    }

    return where;
  }
}

export default new RequestHandler();
