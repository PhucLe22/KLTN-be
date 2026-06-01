/**
 * Helper functions for common operations
 */

/**
 * Convert a string to a slug format
 * @param {string} name - The name to convert
 * @returns {string} The slug version
 */
export function convertToSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '-')
        .trim()
        .replace(/\s+/g, '-');
}

/**
 * Generate a unique slug by appending a timestamp if needed
 * @param {string} name - The base name
 * @returns {string} A unique slug
 */
export function generateUniqueSlug(name) {
    const baseSlug = convertToSlug(name);
    const timestamp = Date.now();
    return `${baseSlug}-${timestamp}`;
}

/**
 * Generate a unique order code
 * Format: VD-{DI|DE|TA}-{TIMESTAMP}
 * @param {string} orderType - The type of the order (DINE_IN, DELIVERY, TAKEAWAY)
 * @returns {string} The generated order code
 */
export function generateOrderCode(orderType) {
    const typeMap = {
        'DINE_IN': 'DI',
        'DELIVERY': 'DE',
        'TAKEAWAY': 'TA'
    };
    
    const typeCode = typeMap[orderType] || 'XX';
    const timestamp = Date.now(); // or new Date().getTime()
    
    return `VD-${typeCode}-${timestamp}`;
}


