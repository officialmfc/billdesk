import { Platform } from "react-native";
import type {
  BatchedUpdateNotification,
  PowerSyncDBListener,
  UpdateNotification,
} from "@powersync/react-native";

import type { BusinessTableName } from "@/data/local-db";
import { BUSINESS_TABLES } from "@/data/local-db/types";

import { powerSyncConnector } from "./powersync/connector";
import { powerSync } from "./powersync/system";

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

type SyncStatusSnapshot = {
  isSubscribed: boolean;
  lastFullSyncAt: string | null;
  recentEvents: RealtimeActivityEvent[];
  revision: number;
  isConnecting: boolean;
  hasSynced: boolean;
  lastError: string | null;
};

function isBatchedUpdate(
  notification: BatchedUpdateNotification | UpdateNotification
): notification is BatchedUpdateNotification {
  return "tables" in notification;
}

function extractTables(
  notification: BatchedUpdateNotification | UpdateNotification
): string[] {
  return isBatchedUpdate(notification) ? notification.tables : [notification.table];
}

export class SyncEngine {
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;
  private listeners = new Set<SyncEngineListener>();
  private recentEvents: RealtimeActivityEvent[] = [];
  private revision = 0;
  private dbUnsubscribe: (() => void) | null = null;
  private statusUnsubscribe: (() => void) | null = null;
  private lastError: string | null = null;

  async initialize(): Promise<void> {
    if (Platform.OS === "web" || this.initialized) {
      return;
    }

    if (!this.initializationPromise) {
      this.initializationPromise = powerSync
        .init()
        .then(() => {
          this.attachListeners();
          this.initialized = true;
          this.lastError = null;
          this.notifyListeners();
        })
        .catch((error) => {
          const message = error instanceof Error ? error.message : "PowerSync initialization failed";
          this.lastError = message;
          this.notifyListeners();
          throw error;
        })
        .finally(() => {
          this.initializationPromise = null;
        });
    }

    await this.initializationPromise;
  }

  async pullAll(): Promise<void> {
    await this.initialize();

    if (powerSync.connected || powerSync.connecting || powerSync.currentStatus.hasSynced) {
      await powerSync.disconnect();
    }

    this.lastError = null;
    await powerSync.connect(powerSyncConnector);
    await powerSync.waitForFirstSync();
    this.notifyListeners();
  }

  async pullChanges(_table: string, _recordId: string): Promise<void> {
    await this.initialize();
    this.notifyListeners();
  }

  async disconnectAndClear(): Promise<void> {
    if (Platform.OS === "web") {
      return;
    }

    if (!this.initialized && !this.initializationPromise) {
      this.recentEvents = [];
      this.revision += 1;
      this.lastError = null;
      this.notifyListeners();
      return;
    }

    await this.initialize();
    await powerSync.disconnectAndClear({ clearLocal: true });
    this.recentEvents = [];
    this.revision += 1;
    this.lastError = null;
    this.notifyListeners();
  }

  subscribeToRealtimeUpdates(_userId: string): void {
    void this.ensureConnected().catch((error) => {
      const message = error instanceof Error ? error.message : "PowerSync connection failed";
      this.lastError = message;
      this.recordRealtimeEvent({
        table: "powersync",
        operation: "ERROR",
        recordId: "",
        status: "error",
        detail: message,
      });
      this.notifyListeners();
    });
  }

  unsubscribeFromRealtimeUpdates(): void {
    if (Platform.OS === "web" || (!powerSync.connected && !powerSync.connecting)) {
      return;
    }

    void powerSync.disconnect().finally(() => {
      this.notifyListeners();
    });
  }

  async applyRealtimeChange(_table: BusinessTableName, _operation: string, _recordId: string): Promise<void> {
    this.notifyListeners();
  }

  async queryAll<T>(sql: string, parameters: unknown[] = []): Promise<T[]> {
    await this.initialize();
    return powerSync.getAll<T>(sql, parameters);
  }

  async queryOptional<T>(sql: string, parameters: unknown[] = []): Promise<T | null> {
    await this.initialize();
    return powerSync.getOptional<T>(sql, parameters);
  }

  async getTableCounts(): Promise<Array<{ tableName: BusinessTableName; count: number }>> {
    await this.initialize();

    return Promise.all(
      BUSINESS_TABLES.map(async (tableName) => {
        const row = await powerSync.getOptional<{ count: number }>(
          `SELECT COUNT(*) as count FROM ${tableName}`
        );

        return {
          tableName,
          count: row?.count ?? 0,
        };
      })
    );
  }

  subscribe(listener: SyncEngineListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  clearRealtimeEvents(): void {
    this.recentEvents = [];
    this.notifyListeners();
  }

  getSyncStatus(): SyncStatusSnapshot {
    const status = powerSync.currentStatus;

    return {
      isSubscribed: status.connected,
      lastFullSyncAt: status.lastSyncedAt?.toISOString() ?? null,
      recentEvents: this.recentEvents,
      revision: this.revision,
      isConnecting: status.connecting,
      hasSynced: Boolean(status.hasSynced),
      lastError:
        this.lastError ??
        status.dataFlowStatus.downloadError?.message ??
        status.dataFlowStatus.uploadError?.message ??
        null,
    };
  }

  private async ensureConnected(): Promise<void> {
    await this.initialize();

    if (powerSync.connected || powerSync.connecting) {
      return;
    }

    this.lastError = null;
    await powerSync.connect(powerSyncConnector);
    this.notifyListeners();
  }

  private attachListeners() {
    if (this.dbUnsubscribe || this.statusUnsubscribe) {
      return;
    }

    this.dbUnsubscribe = powerSync.database.registerListener({
      tablesUpdated: (notification) => {
        const tables = extractTables(notification);
        this.revision += 1;

        for (const table of tables) {
          this.recordRealtimeEvent({
            table,
            operation: "SYNC",
            recordId: "",
            status: "applied",
            detail: "PowerSync applied an update to the local read model.",
          });
        }

        this.notifyListeners();
      },
    });

    const listener: Partial<PowerSyncDBListener> = {
      initialized: () => {
        this.notifyListeners();
      },
      statusChanged: (status) => {
        const nextError =
          status.dataFlowStatus.downloadError?.message ??
          status.dataFlowStatus.uploadError?.message ??
          null;

        if (nextError && nextError !== this.lastError) {
          this.recordRealtimeEvent({
            table: "powersync",
            operation: "ERROR",
            recordId: "",
            status: "error",
            detail: nextError,
          });
        }

        this.lastError = nextError;
        this.notifyListeners();
      },
      closed: () => {
        this.recordRealtimeEvent({
          table: "powersync",
          operation: "CLOSED",
          recordId: "",
          status: "invalid",
          detail: "PowerSync connection closed.",
        });
        this.notifyListeners();
      },
    };

    this.statusUnsubscribe = powerSync.registerListener(listener);
  }

  private recordRealtimeEvent(
    event: Omit<RealtimeActivityEvent, "id" | "timestamp"> & { timestamp?: string }
  ): void {
    this.recentEvents = [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        timestamp: event.timestamp ?? new Date().toISOString(),
        ...event,
      },
      ...this.recentEvents,
    ].slice(0, 30);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const syncEngine = new SyncEngine();
