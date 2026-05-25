// Simple in-memory rate limiter (single-instance)
const hits = new Map();

export function rateLimit(key, { windowMs = 60_000, max = 10 } = {}) {
  const now = Date.now();
  const rec = hits.get(key);
  if (!rec || now - rec.start > windowMs) {
    hits.set(key, { start: now, count: 1 });
    return { allowed: true, remaining: max - 1 };
  }
  if (rec.count >= max) return { allowed: false, remaining: 0, retryAfter: Math.ceil((rec.start + windowMs - now) / 1000) };
  rec.count++;
  return { allowed: true, remaining: max - rec.count };
}

export function getClientIp(req) {
  const xff = req.headers.get('x-forwarded-for') || '';
  return xff.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}
