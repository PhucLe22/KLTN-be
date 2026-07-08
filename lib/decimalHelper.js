
export function sanitizeDecimal(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle Prisma Decimal/Decimal.js
  const constructorName = obj.constructor?.name;
  if (constructorName === 'Decimal' || constructorName === 'Decimal2' || typeof obj.toNumber === 'function') {
    return obj.toNumber();
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeDecimal);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Only process own properties to avoid issues with prototype/functions
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = sanitizeDecimal(value);
    }
  }
  return sanitized;
}
