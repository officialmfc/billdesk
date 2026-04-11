import type { BusinessTableName } from "@/data/local-db";

export type RealtimeActivityEvent = {
  id: string;
  table: string;
  operation: string;
  recordId: string;
  status: "applied" | "deleted" | "invalid" | "error";
  timestamp: string;
  detail?: string;
};

type SyncEngineListener = () => void;

class SyncEngine {
  async initialize(): Promise<void> {}
  async pullAll(): Promise<void> {}
  async pullChanges(): Promise<void> {}
  async disconnectAndClear(): Promise<void> {}
  async queryAll<T>(): Promise<T[]> {
    return [];
  }
  async queryOptional<T>(): Promise<T | null> {
    return null;
  }
  async getTableCounts() {
    return [];
  }
  subscribeToRealtimeUpdates(): void {}
  unsubscribeFromRealtimeUpdates(): void {}
  clearRealtimeEvents(): void {}
  subscribe(_listener: SyncEngineListener): () => void {
    return () => undefined;
  }
  applyRealtimeChange(_table: BusinessTableName, _operation: string, _recordId: string): Promise<void> {
    return Promise.resolve();
  }
  getSyncStatus() {
    return {
      isSubscribed: false,
      lastFullSyncAt: null,
      recentEvents: [] as RealtimeActivityEvent[],
      revision: 0,
      isConnecting: false,
      hasSynced: false,
      lastError: null as string | null,
    };
  }
}

export const syncEngine = new SyncEngine();
