// src/lib/rateLimiter.js

const store = new Map();

export function rateLimit({ key, windowMs = 60_000, max = 10 }) {
    const now = Date.now();

    if (!store.has(key)) {
        store.set(key, { count: 1, start: now });
        return { success: true, count: 1 };
    }

    const data = store.get(key);

    if (now - data.start > windowMs) {
        store.set(key, { count: 1, start: now });
        return { success: true, count: 1 };
    }

    data.count++;

    return {
        success: data.count <= max,
        count: data.count,
    };
}

// cleanup memoria
setInterval(() => {
    const now = Date.now();

    for (const [key, value] of store.entries()) {
        if (now - value.start > 5 * 60_000) {
            store.delete(key);
        }
    }
}, 60_000);