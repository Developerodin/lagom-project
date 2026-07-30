type RateLimitOptions = {
  windowMs: number;
  maxAttempts: number;
};

const buckets = new Map<string, number[]>();

function prune(key: string, windowMs: number, now: number) {
  const previous = (buckets.get(key) ?? []).filter(
    (timestamp) => now - timestamp < windowMs,
  );
  buckets.set(key, previous);
  return previous;
}

export function isRateLimited(key: string, options: RateLimitOptions): boolean {
  const now = Date.now();
  const previous = prune(key, options.windowMs, now);
  return previous.length >= options.maxAttempts;
}

export function recordAttempt(key: string, options: RateLimitOptions): void {
  const now = Date.now();
  const previous = prune(key, options.windowMs, now);
  previous.push(now);
  buckets.set(key, previous);
}

export function clearAttempts(key: string): void {
  buckets.delete(key);
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
