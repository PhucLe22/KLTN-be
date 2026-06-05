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

    const rows = await model.findMany({
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