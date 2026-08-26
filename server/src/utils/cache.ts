/**
 * Minimal in-memory TTL cache. Good enough to avoid hammering the upstream API
 * for repeated identical queries within a short window. Not a distributed cache
 * — intentionally simple (the spec says "do not over-engineer caching").
 */
interface Entry<V> {
  value: V;
  expiresAt: number; // epoch ms
}

export class TtlCache<V> {
  private store = new Map<string, Entry<V>>();

  constructor(private readonly defaultTtlMs: number, private readonly maxEntries = 500) {}

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: V, ttlMs = this.defaultTtlMs): void {
    // Simple size guard: drop the oldest inserted key when full.
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}
