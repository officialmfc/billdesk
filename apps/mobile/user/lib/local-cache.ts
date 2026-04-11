import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "mfc-user-cache.db";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function initialize(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS cache_entries (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sync_metadata (
      table_name TEXT PRIMARY KEY NOT NULL,
      last_sync TEXT NOT NULL
    );
  `);
}

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await initialize(db);
      return db;
    });
  }

  return databasePromise;
}

type CacheRow = {
  updated_at: string;
  value: string;
};

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
  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM cache_entries;
    DELETE FROM sync_metadata;
  `);
}

export async function getCachedCollection<T>(key: string): Promise<T[]> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<CacheRow>(
    "SELECT value, updated_at FROM cache_entries WHERE key = ?",
    [key]
  );

  return parseJson<T[]>(row?.value ?? null) ?? [];
}

export async function putCachedCollection<T>(key: string, rows: T[]): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `
      INSERT INTO cache_entries (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `,
    [key, JSON.stringify(rows), new Date().toISOString()]
  );
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

  await putCachedCollection(key, Array.from(next.values()));
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

  await putCachedCollection(key, filtered);
}

export async function getLastSync(tableName: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ last_sync: string }>(
    "SELECT last_sync FROM sync_metadata WHERE table_name = ?",
    [tableName]
  );

  return row?.last_sync ?? null;
}

export async function setLastSync(tableName: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `
      INSERT INTO sync_metadata (table_name, last_sync)
      VALUES (?, ?)
      ON CONFLICT(table_name) DO UPDATE SET
        last_sync = excluded.last_sync
    `,
    [tableName, value]
  );
}
