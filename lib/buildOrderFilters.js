/**
 * Build Prisma where clause for order queries from request filters.
 * Reusable for both customer and staff contexts.
 *
 * @param {Object} options
 * @param {string|null} options.userId - Customer user ID (for customer context)
 * @param {string|null} options.storeId - Store ID (for staff context)
 * @param {Object} options.query - Query params: { status, type, store_id, minPrice, maxPrice, page, limit }
 * @returns {{ where: Object, page: number, limit: number }}
 */
export function buildOrderFilters({ userId, storeId, query = {} }) {
  const { status, type, store_id, minPrice, maxPrice, page = 1, limit = 10 } = query;

  const where = {};

  // Context: customer orders
  if (userId) {
    where.customer = { userId };
  }

  // Context: staff viewing store orders (from token)
  if (storeId) {
    where.storeId = storeId;
  }

  // Manual store_id filter (override or additional)
  if (store_id) {
    where.storeId = store_id;
  }

  // Common filters
  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  // Price range filters
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.total = {};
    if (minPrice !== undefined) {
      where.total.gte = Number(minPrice);
    }
    if (maxPrice !== undefined) {
      where.total.lte = Number(maxPrice);
    }
  }

  return {
    where,
    page: Number(page),
    limit: Number(limit),
  };
}
