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

export function cachedFetch(url, options = {}) {
  const ttl = options.ttl ?? 60_000;
  const key = options.key ?? (typeof url === "string" ? url : url.toString());

  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return Promise.resolve(cached.response.clone());
  }

  return fetch(url, options).then((res) => {
    if (!res.ok) return res;

    cache.set(key, {
      response: res.clone(),
      timestamp: Date.now(),
    });

    return res;
  });
}

export function clearCache(key) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
