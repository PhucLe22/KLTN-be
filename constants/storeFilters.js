// Store filter constants for better readability and maintenance
export const STORE_FILTERS = {
  // Sort options
  SORT_BY: {
    CREATED_AT: 'createdAt',
    NAME: 'name',
    CODE: 'code'
  },
  
  // Sort order
  SORT_ORDER: {
    ASC: 'asc',
    DESC: 'desc'
  },
  
  // Boolean filters
  BOOLEAN: {
    TRUE: 'true',
    FALSE: 'false'
  }
};

// Query builder helpers
export const buildStoreFilters = (query) => {
  const { search, sortBy = STORE_FILTERS.SORT_BY.CREATED_AT, sortOrder = STORE_FILTERS.SORT_ORDER.DESC, isActive, isDeleted = STORE_FILTERS.BOOLEAN.FALSE } = query;
  
  const where = {};
  
  // Search filter
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }
  
  // Active status filter
  if (isActive !== undefined) {
    where.isActive = isActive === STORE_FILTERS.BOOLEAN.TRUE;
  }
  
  // Deleted status filter
  if (isDeleted !== undefined) {
    where.isDeleted = isDeleted === STORE_FILTERS.BOOLEAN.TRUE;
  }
  
  return { where, sortBy, sortOrder };
};

// Store select fields
export const STORE_SELECT_FIELDS = {
  id: true,
  code: true,
  name: true,
  address: true,
  hotline: true,
  lat: true,
  lng: true,
  isActive: true,
  isDeleted: true
};
