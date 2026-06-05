const isObject = (v) =>
    v && typeof v === 'object' && !Array.isArray(v);

const get = (obj, path) =>
    path.split('.').reduce((acc, k) => acc?.[k], obj);

export function mapper(data, schema, ctx = {}) {
    if (Array.isArray(data)) {
        return data.map(item =>
            mapper(item, schema, ctx)
        );
    }

    return transformObject(data, schema, ctx);
}

function transformObject(source, schema, ctx) {
    const result = {};

    for (const key in schema) {
        const rule = schema[key];

        // 1. Function → computed field
        if (typeof rule === 'function') {
            result[key] = rule(source, ctx);
            continue;
        }

        // 2. Boolean shorthand (auto pick)
        if (rule === true) {
            result[key] = source?.[key];
            continue;
        }

        // 3. String path mapping
        if (typeof rule === 'string') {
            result[key] = get(source, rule);
            continue;
        }

        // 4. Advanced rule object
        if (isObject(rule)) {
            result[key] = processAdvanced(
                source,
                rule,
                ctx
            );
            continue;
        }

        // 5. Array schema
        if (Array.isArray(rule)) {
            const subSchema = rule[0];
            const arr = get(source, key) || [];
            result[key] = arr.map(item =>
                mapper(item, subSchema, ctx)
            );
        }
    }

    return result;
}

function processAdvanced(source, rule, ctx) {
    // ROLE CHECK
    if (rule.$allow) {
        const role = ctx.role;

        if (!rule.$allow.includes(role)) {
            return undefined;
        }
    }

    // CUSTOM SOURCE
    const base =
        rule.$from
            ? source?.[rule.$from]
            : source;

    // PATH
    if (rule.$path) {
        let value = get(base, rule.$path);

        // PIPE TRANSFORM
        if (rule.$pipe) {
            value = rule.$pipe.reduce(
                (acc, fn) => fn(acc, ctx),
                value
            );
        }

        return value;
    }

    // DATE FORMAT
    if (rule.$date) {
        const value = get(base, rule.$path || 'createdAt');

        return formatDate(value, rule.$date);
    }

    // NESTED OBJECT
    if (isObject(rule)) {
        return mapper(base, rule, ctx);
    }

    return undefined;
}

function formatDate(date, format) {
    const d = new Date(date);

    if (format === true) {
        return d.toISOString();
    }

    if (format === 'YYYY-MM-DD') {
        return d.toISOString().split('T')[0];
    }

    return d.toISOString();
}