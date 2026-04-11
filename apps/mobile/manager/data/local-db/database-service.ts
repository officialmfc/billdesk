import type { BusinessTableName, SyncTableName, TableRecordMap } from "./types";
import { drizzleTables } from "./schema";
import { syncEngine } from "@/lib/sync-engine";

type LocalDbListener = () => void;

export class MobileDatabaseService {
  initialize() {
    void syncEngine.initialize().catch((error) => {
      console.error("[MobileDatabaseService] PowerSync initialization failed:", error);
    });
  }

  subscribe(listener: LocalDbListener) {
    return syncEngine.subscribe(listener);
  }

  async clearAllTables() {
    await syncEngine.disconnectAndClear();
  }

  async getTableCounts() {
    return syncEngine.getTableCounts();
  }

  updateSyncMetadata(_tableName: BusinessTableName, _status: "idle" | "syncing" | "error", _errorMessage: string | null = null) {}

  resetAndSeedSyncTables(
    _seedData: Partial<{ [K in BusinessTableName]: TableRecordMap[K][] }> = {}
  ) {}

  upsertMany<TTable extends SyncTableName>(
    _tableName: TTable,
    _rows: TableRecordMap[TTable][],
    _notify = true
  ) {}

  upsertOne<TTable extends SyncTableName>(
    _tableName: TTable,
    _row: TableRecordMap[TTable],
    _notify = true
  ) {}

  deleteOne(_tableName: SyncTableName, _id: string, _notify = true) {}
}

export const databaseService = new MobileDatabaseService();
export { drizzleTables };
