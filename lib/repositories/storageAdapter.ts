// DATA_CHANGE_EVENT — used by all pages to trigger data refresh after mutations
export const DATA_CHANGE_EVENT = "himel-agro-data-updated";

// In-flight request deduplication map and short-lived fast cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

export function clearDataCache(): void {
  memoryCache.clear();
  inFlightRequests.clear();
}

export function notifyDataChanged(): void {
  clearDataCache();
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
}

/**
 * Executes a network fetch with inflight promise deduplication and short-lived caching.
 * If 5 components request the exact same endpoint simultaneously, only 1 network request is made.
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 4000
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(key);

  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data as T;
  }

  // If a request for the same key is already in flight, reuse the promise
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = (async () => {
    try {
      const result = await fetcher();
      memoryCache.set(key, { data: result, timestamp: Date.now() });
      return result;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

// Export all data from MongoDB as a JSON backup
export async function exportAllData(): Promise<string> {
  const res = await fetch("/api/seed");
  if (!res.ok) throw new Error("Failed to export data from MongoDB");
  const data = await res.json();
  return JSON.stringify(data, null, 2);
}

// Import data into MongoDB from a JSON backup string
export async function importAllData(jsonString: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonString);
    const res = await fetch("/api/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    });
    if (!res.ok) return false;
    notifyDataChanged();
    return true;
  } catch (err) {
    console.error("Failed to import data:", err);
    return false;
  }
}

// Reset MongoDB to the original demo seed data
export async function resetToSeedData(): Promise<void> {
  const res = await fetch("/api/seed?reset=true", { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset seed data");
  notifyDataChanged();
}
