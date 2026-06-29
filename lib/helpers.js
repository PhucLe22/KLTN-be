import slugify from "slugify";

export const createSlug = async (
    model,
    value,
) => {
    const baseSlug = slugify(value, {
        lower: true,
        strict: true,
        trim: true,
    });

    const rows = await model.getModel().findMany({
        where: {
            slug: {
                startsWith: baseSlug,
            },
        },
        select: {
            slug: true,
        },
    });

    const existing = new Set(
        rows.map((r) => r.slug),
    );

    if (!existing.has(baseSlug)) {
        return baseSlug;
    }

    let counter = 1;

    while (
        existing.has(`${baseSlug}-${counter}`)
    ) {
        counter++;
    }

    return `${baseSlug}-${counter}`;
};

/**
 * Calculate distance between two points using Haversine formula
 * @returns {number} distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};