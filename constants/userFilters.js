// User filter constants for better readability and maintenance
export const USER_FILTERS = {
  // Sort options
  SORT_BY: {
    CREATED_AT: 'createdAt',
    EMAIL: 'email',
    PHONE: 'phone'
  },
  
  // Sort order
  SORT_ORDER: {
    ASC: 'asc',
    DESC: 'desc'
  },
  
  // User roles
  ROLES: {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    STAFF: 'STAFF',
    CUSTOMER: 'CUSTOMER'
  },
  
  // Boolean filters
  BOOLEAN: {
    TRUE: 'true',
    FALSE: 'false'
  }
};

// Query builder helpers
export const buildUserFilters = (query) => {
  const { search, sortBy = USER_FILTERS.SORT_BY.CREATED_AT, sortOrder = USER_FILTERS.SORT_ORDER.DESC, isActive, role, staff } = query;
  
  const where = {};
  const orConditions = [];
  
  // Search filter
  if (search) {
    orConditions.push(
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } }
    );
  }
  
  // Active status filter
  if (isActive !== undefined) {
    where.isActive = isActive === USER_FILTERS.BOOLEAN.TRUE;
  }
  
  // Role filter
  if (role) {
    if (role === USER_FILTERS.ROLES.CUSTOMER) {
      orConditions.push({ customer: { isNot: null } });
    } else {
      orConditions.push({ staff: { role: role } });
    }
  }
  
  // Staff relationship filter
  if (staff !== undefined) {
    if (staff === USER_FILTERS.BOOLEAN.TRUE) {
      orConditions.push({ staff: { isNot: null } });
    } else {
      orConditions.push({ staff: { is: null } });
    }
  }
  
  // Apply OR conditions
  if (orConditions.length > 0) {
    where.OR = orConditions;
  }
  
  return { where, sortBy, sortOrder };
};

// User select fields
export const USER_SELECT_FIELDS = {
  id: true,
  email: true,
  phone: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  staff: {
    select: {
      id: true,
      role: true,
      storeId: true
    }
  },
  customer: {
    select: {
      id: true,
      name: true
    }
  }
};
