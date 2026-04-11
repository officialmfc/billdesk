import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { app } from "electron";
import { Worker } from "node:worker_threads";
import {
  PowerSyncDatabase,
  type AbstractPowerSyncDatabase,
  type CrudEntry,
  type PowerSyncBackendConnector,
  type PowerSyncCredentials,
} from "@powersync/node";
import { MANAGER_POWERSYNC_DB_FILENAME } from "@mfc/manager-sync-model";

import { desktopEnv } from "./env";
import { getCurrentAccessToken, getCurrentTokenExpiration } from "./supabase";
import { powerSyncSchema } from "./powersync-schema";

const FATAL_RESPONSE_CODES = [/^22...$/, /^23...$/, /^42501$/];

function rewriteAsarPath(target: string): string {
  return target.replace(`${path.sep}app.asar${path.sep}`, `${path.sep}app.asar.unpacked${path.sep}`);
}

function getPackagedWorkerSpecifier(specifier: string | URL): string | URL {
  if (!app.isPackaged) {
    return specifier;
  }

  if (typeof specifier === "string") {
    return rewriteAsarPath(specifier);
  }

  if (specifier.protocol === "file:") {
    return pathToFileURL(rewriteAsarPath(fileURLToPath(specifier)));
  }

  return specifier;
}

function openPowerSyncWorker(...args: ConstructorParameters<typeof Worker>): Worker {
  const [filename, options] = args;
  return new Worker(getPackagedWorkerSpecifier(filename), options);
}

class SupabasePowerSyncConnector implements PowerSyncBackendConnector {
  async fetchCredentials(): Promise<PowerSyncCredentials> {
    const token = await getCurrentAccessToken();
    const expiresAt = await getCurrentTokenExpiration();

    if (!token) {
      throw new Error("Could not fetch Supabase credentials: no session");
    }

    return {
      endpoint: desktopEnv.powersyncUrl,
      token,
      expiresAt,
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    let lastOp: CrudEntry | null = null;

    try {
      for (const op of transaction.crud) {
        lastOp = op;
      }

      console.warn("[Desktop PowerSync] Discarding upload queue item because desktop writes go direct to Supabase.", {
        lastOp,
      });

      await transaction.complete();
    } catch (error: any) {
      if (
        typeof error?.code === "string" &&
        FATAL_RESPONSE_CODES.some((regex) => regex.test(error.code))
      ) {
        await transaction.complete();
        return;
      }

      throw error;
    }
  }
}

export type DesktopSyncStatus = {
  connected: boolean;
  connecting: boolean;
  hasSynced: boolean;
  lastSyncedAt: string | null;
  lastError: string | null;
};

class ManagerPowerSyncService {
  private readonly database = new PowerSyncDatabase({
    schema: powerSyncSchema,
    database: {
      dbFilename: path.join(app.getPath("userData"), MANAGER_POWERSYNC_DB_FILENAME),
      openWorker: openPowerSyncWorker,
    },
  });
  private readonly connector = new SupabasePowerSyncConnector();
  private connectPromise: Promise<void> | null = null;

  async connect(waitForFirstSync = true): Promise<void> {
    if (this.database.currentStatus.connected || this.database.currentStatus.connecting) {
      if (waitForFirstSync) {
        await this.database.waitForFirstSync();
      }
      return;
    }

    if (!this.connectPromise) {
      this.connectPromise = (async () => {
        await this.database.connect(this.connector);
        if (waitForFirstSync) {
          await this.database.waitForFirstSync();
        }
      })().finally(() => {
        this.connectPromise = null;
      });
    }

    await this.connectPromise;
  }

  async refresh(): Promise<void> {
    if (this.database.currentStatus.connected || this.database.currentStatus.connecting) {
      await this.database.disconnect();
    }

    await this.connect(true);
  }

  async disconnectAndClear(): Promise<void> {
    await this.database.disconnectAndClear({ clearLocal: true });
  }

  async getAll<T>(sql: string, parameters: unknown[] = []): Promise<T[]> {
    await this.connect(false);
    return this.database.getAll<T>(sql, parameters);
  }

  getStatus(): DesktopSyncStatus {
    const status = this.database.currentStatus;

    return {
      connected: Boolean(status.connected),
      connecting: Boolean(status.connecting),
      hasSynced: Boolean(status.hasSynced),
      lastSyncedAt: status.lastSyncedAt?.toISOString() ?? null,
      lastError:
        status.dataFlowStatus.downloadError?.message ??
        status.dataFlowStatus.uploadError?.message ??
        null,
    };
  }
}

let powerSyncService: ManagerPowerSyncService | null = null;

export function getPowerSyncService(): ManagerPowerSyncService {
  if (!powerSyncService) {
    powerSyncService = new ManagerPowerSyncService();
  }

  return powerSyncService;
}
