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
  const { 
    status, 
    type, 
    store_id, 
    minTotal, 
    maxTotal, 
    startDate, 
    endDate,
    page = 1, 
    limit = 10 
  } = query;

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

  // Price/Total filters
  if (minTotal !== undefined || maxTotal !== undefined) {
    where.total = {};
    if (minTotal !== undefined) {
      where.total.gte = Number(minTotal);
    }
    if (maxTotal !== undefined) {
      where.total.lte = Number(maxTotal);
    }
  }

  // Date filters
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  return {
    where,
    page: Number(page),
    limit: Number(limit),
  };
}
