/**
 * Small shared helpers for entity definitions.
 * This layer is intentionally thin: it standardizes common `select/include`
 * objects for Prisma queries without hiding Prisma itself.
 */

/**
 * @template {string} TName
 * @param {TName} name
 * @param {{ select?: any, include?: any }} [opts]
 */
export function defineEntity(name, opts = {}) {
  return Object.freeze({
    name,
    select: opts.select ?? undefined,
    include: opts.include ?? undefined,
  });
}

