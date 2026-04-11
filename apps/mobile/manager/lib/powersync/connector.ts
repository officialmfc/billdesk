import type {
  AbstractPowerSyncDatabase,
  CrudEntry,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from "@powersync/react-native";
import Constants from "expo-constants";

import { supabase } from "@/lib/supabase";

const FATAL_RESPONSE_CODES = [
  /^22...$/,
  /^23...$/,
  /^42501$/,
];

const powerSyncUrl =
  Constants.expoConfig?.extra?.powersyncUrl || process.env.EXPO_PUBLIC_POWERSYNC_URL;

if (!powerSyncUrl) {
  throw new Error("Missing PowerSync environment variable: EXPO_PUBLIC_POWERSYNC_URL");
}

export class SupabasePowerSyncConnector implements PowerSyncBackendConnector {
  async fetchCredentials(): Promise<PowerSyncCredentials> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (!session || error) {
      throw new Error(`Could not fetch Supabase credentials: ${error?.message ?? "no session"}`);
    }

    return {
      endpoint: powerSyncUrl,
      token: session.access_token ?? "",
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : undefined,
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

      console.warn(
        "[PowerSync] Discarding local PowerSync CRUD transaction because this app writes directly to Supabase RPCs/tables.",
        { lastOp }
      );

      await transaction.complete();
    } catch (error: any) {
      if (
        typeof error?.code === "string" &&
        FATAL_RESPONSE_CODES.some((regex) => regex.test(error.code))
      ) {
        console.error("[PowerSync] Fatal upload error - discarding transaction:", lastOp, error);
        await transaction.complete();
        return;
      }

      throw error;
    }
  }
}

export const powerSyncConnector = new SupabasePowerSyncConnector();
