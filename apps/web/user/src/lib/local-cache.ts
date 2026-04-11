type StorageMap = Record<string, string>;

const CACHE_PREFIX = "mfc-user-web-cache:";
const LAST_SYNC_PREFIX = "mfc-user-web-sync:";

const memoryCache = new Map<string, string>();

function hasWindowStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function storageGet(key: string): string | null {
  if (hasWindowStorage()) {
    return window.localStorage.getItem(key);
  }

  return memoryCache.get(key) ?? null;
}

function storageSet(key: string, value: string): void {
  if (hasWindowStorage()) {
    window.localStorage.setItem(key, value);
    return;
  }

  memoryCache.set(key, value);
}

function storageRemove(key: string): void {
  if (hasWindowStorage()) {
    window.localStorage.removeItem(key);
    return;
  }

  memoryCache.delete(key);
}

function storageKeys(prefix: string): string[] {
  if (hasWindowStorage()) {
    const keys: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  }

  return Array.from(memoryCache.keys()).filter((key) => key.startsWith(prefix));
}

function cacheKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

function syncKey(tableName: string): string {
  return `${LAST_SYNC_PREFIX}${tableName}`;
}

function parseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function clearLocalCache(): Promise<void> {
  for (const key of storageKeys(CACHE_PREFIX)) {
    storageRemove(key);
  }

  for (const key of storageKeys(LAST_SYNC_PREFIX)) {
    storageRemove(key);
  }
}

export async function getCachedCollection<T>(key: string): Promise<T[]> {
  const row = parseJson<T[]>(storageGet(cacheKey(key)));
  return row ?? [];
}

export async function putCachedCollection<T>(key: string, rows: T[]): Promise<void> {
  storageSet(cacheKey(key), JSON.stringify(rows));
}

export async function mergeCachedCollection<T extends Record<string, unknown>>(
  key: string,
  rows: T[],
  primaryKey: keyof T
): Promise<void> {
  if (rows.length === 0) {
    return;
  }

  const existing = await getCachedCollection<T>(key);
  const next = new Map<string, T>();

  for (const row of existing) {
    const id = row[primaryKey];
    if (typeof id === "string" && id.length > 0) {
      next.set(id, row);
    }
  }

  for (const row of rows) {
    const id = row[primaryKey];
    if (typeof id === "string" && id.length > 0) {
      next.set(id, row);
    }
  }

  await putCachedCollection<T>(key, Array.from(next.values()));
}

export async function deleteFromCachedCollection<T extends Record<string, unknown>>(
  key: string,
  ids: string[],
  primaryKey: keyof T
): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const idSet = new Set(ids);
  const existing = await getCachedCollection<T>(key);
  const filtered = existing.filter((row) => {
    const id = row[primaryKey];
    return typeof id !== "string" || !idSet.has(id);
  });

  await putCachedCollection<T>(key, filtered);
}

export async function getLastSync(tableName: string): Promise<string | null> {
  return storageGet(syncKey(tableName));
}

export async function setLastSync(tableName: string, value: string): Promise<void> {
  storageSet(syncKey(tableName), value);
}
