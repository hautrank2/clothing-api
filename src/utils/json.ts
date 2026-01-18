// utils/json.ts
export function parseJsonObject<T extends Record<string, any>>(
  v: unknown,
  fallback: T = {} as T,
): T {
  if (v == null) return fallback;
  if (typeof v === 'object' && !Array.isArray(v)) return v as T;
  if (typeof v === 'string') {
    const s = v.trim();
    if (!s) return fallback;
    try {
      const parsed = JSON.parse(s);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as T)
        : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function parseJsonArray<T = any>(v: unknown, fallback: T[] = []): T[] {
  if (v == null) return fallback;
  if (Array.isArray(v)) return v as T[];
  if (typeof v === 'string') {
    const s = v.trim();
    if (!s) return fallback;
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? (parsed as T[]) : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}
