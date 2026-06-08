const cache = new Map();

const CLEANUP_INTERVAL = 60_000;
const MAX_AGE = 600_000;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.timestamp > MAX_AGE) {
      cache.delete(key);
    }
  }
}, CLEANUP_INTERVAL).unref();

export async function cachedFetch(url, options = {}) {
  const ttl = options.ttl ?? 60_000;
  const key = options.key ?? String(url);

  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();

  cache.set(key, {
    data,
    timestamp: Date.now(),
  });

  return data;
}

export function clearCache(key) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}