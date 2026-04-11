/**
 * Realtime Sync Provider
 * React context provider for realtime sync functionality
 */

"use client";

import type { MFCBillDeskDB } from "@mfc/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { SyncEngine, createSyncEngine } from "../core/SyncEngine";
import {
    REALTIME_EVENT_NAME,
    RealtimeManager
} from "../realtime/RealtimeManager";
import type {
    ISyncStrategy,
    RealtimeEventPayload,
    SyncQueryContext,
} from "../types";

export interface RealtimeSyncContextType {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  syncNow: () => Promise<void>;
  syncTable: (tableName: string) => Promise<void>;
  isOnline: boolean;
  isAutoSync: boolean;
  setIsAutoSync: (enabled: boolean) => void;
}

const RealtimeSyncContext = createContext<RealtimeSyncContextType | undefined>(
  undefined
);

export interface RealtimeSyncProviderProps {
  children: ReactNode;
  supabaseClient: SupabaseClient;
  database: MFCBillDeskDB;
  strategy: ISyncStrategy;
  context?: SyncQueryContext;
  autoSync?: boolean;
  logger?: {
    debug: (msg: string, ...args: any[]) => void;
    info: (msg: string, ...args: any[]) => void;
    warn: (msg: string, ...args: any[]) => void;
    error: (msg: string, ...args: any[]) => void;
  };
}

export function RealtimeSyncProvider({
  children,
  supabaseClient,
  database,
  strategy,
  context,
  autoSync = true,
  logger = console,
}: RealtimeSyncProviderProps) {
  // console.debug("🚀 RealtimeSyncProvider MOUNTED");
  // console.debug("Strategy:", strategy);
  // console.debug("AutoSync:", autoSync);

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isAutoSync, setIsAutoSync] = useState(autoSync);

  const syncEngineRef = useRef<SyncEngine | null>(null);
  const realtimeManagerRef = useRef<RealtimeManager | null>(null);
  const syncInProgressRef = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize sync engine
  useEffect(() => {
    syncEngineRef.current = createSyncEngine({
      supabaseClient,
      database,
      strategy,
      context,
      onSyncStart: () => setIsSyncing(true),
      onSyncComplete: () => {
        setIsSyncing(false);
        setLastSyncTime(new Date());
        setSyncError(null);
      },
      onSyncError: (error) => {
        setIsSyncing(false);
        setSyncError(error.message);
      },
    });

    // Auto-sync on mount if online and authenticated
    if (typeof navigator !== "undefined" && navigator.onLine && isAutoSync) {
      console.debug("[RealtimeSync] Auto-syncing on mount...");
      // Check auth before syncing
      supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setTimeout(() => {
            syncNow();
          }, 1000);
        } else {
          console.debug("[RealtimeSync] No session, skipping auto-sync");
        }
      });
    }

    // Cleanup
    return () => {
      if (syncEngineRef.current) {
        syncEngineRef.current.cleanup();
        syncEngineRef.current = null;
      }
    };
  }, [supabaseClient, database, strategy]);

  // Initialize realtime - DIRECT APPROACH (bypassing RealtimeManager)
  useEffect(() => {
    console.debug("🔌 DIRECT REALTIME SETUP STARTING...");
    const realtimeConfig = strategy.getRealtimeConfig();
    const tables = realtimeConfig.tables || [];

    console.debug(`📋 Setting up realtime for ${tables.length} tables:`, tables);

    // Create channel directly (like SimpleRealtimeTest)
    const channel = supabaseClient.channel("manager-realtime-direct");

    // Subscribe to each table
    tables.forEach((table) => {
      console.debug(`📋 Registering postgres_changes listener for: ${table}`);
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
        },
        (payload: any) => {
          console.debug(
            `🎯 DIRECT REALTIME: Event on ${payload.table} - ${payload.eventType}`
          );

          // Dispatch to window
          if (typeof window !== "undefined") {
            const event = new CustomEvent(REALTIME_EVENT_NAME, {
              detail: {
                table: payload.table,
                eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
                recordId: payload.new?.id || payload.old?.id,
                schema: payload.schema,
                timestamp: new Date().toISOString(),
              },
            });
            window.dispatchEvent(event);
          }
        }
      );
    });

    // Subscribe
    channel.subscribe((status, err) => {
      console.debug(`📊 Direct channel status: ${status}`);
      if (err) {
        console.error("❌ Direct channel error:", err);
      }
      if (status === "SUBSCRIBED") {
        console.debug(
          `✅ DIRECT REALTIME: Successfully subscribed to ${tables.length} tables!`
        );
      }
    });

    // Cleanup
    return () => {
      console.debug("🧹 Cleaning up direct realtime channel...");
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, strategy]);

  // Sync specific table
  const syncTable = useCallback(
    async (tableName: string) => {
      // Check online status first
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        console.warn(`📴 Cannot sync ${tableName} - offline`);
        return;
      }

      if (!syncEngineRef.current) {
        console.warn(
          `⚠️  Cannot sync ${tableName} - sync engine not initialized`
        );
        return;
      }

      // Check authentication before syncing
      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();
        if (!session) {
          console.warn(`⚠️  No active session, skipping sync for ${tableName}`);
          return;
        }
      } catch (authError) {
        console.error(`❌ Auth check failed for ${tableName}:`, authError);
        return;
      }

      try {
        console.debug(`🔄 SYNCING TABLE: ${tableName}`);

        const startTime = Date.now();
        await syncEngineRef.current.syncTable(tableName);
        const duration = Date.now() - startTime;

        console.debug(`✅ SYNC COMPLETE: ${tableName} (${duration}ms)`);

        setLastSyncTime(new Date());
      } catch (error) {
        console.error(`❌ SYNC FAILED: ${tableName}`, error);
      }
    },
    [supabaseClient]
  );

  // Full sync
  const syncNow = useCallback(async () => {
    if (syncInProgressRef.current) {
      logger.warn("⚠️  Sync already in progress");
      return;
    }

    // Check online status first
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      console.log("📴 Offline, skipping sync");
      return;
    }

    if (!syncEngineRef.current) {
      logger.warn("⚠️  Sync engine not initialized");
      return;
    }

    // Check authentication
    try {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();
      if (!session) {
        console.warn("⚠️  No active session, skipping sync");
        return;
      }
    } catch (authError) {
      console.error("❌ Auth check failed:", authError);
      return;
    }

    syncInProgressRef.current = true;
    setIsSyncing(true);

    try {
      console.debug("🔄 Starting full sync...");
      await syncEngineRef.current.fullSync();
      console.debug("✅ Full sync completed");
      setLastSyncTime(new Date());
      setSyncError(null);
    } catch (error) {
      console.error("❌ Sync failed:", error);
      setSyncError(error instanceof Error ? error.message : String(error));
    } finally {
      syncInProgressRef.current = false;
      setIsSyncing(false);
    }
  }, [supabaseClient]);

  // Store handler in ref to avoid re-registering listeners
  const handleRealtimeEventRef = useRef<
    ((payload: RealtimeEventPayload) => void) | undefined
  >(undefined);

  handleRealtimeEventRef.current = (payload: RealtimeEventPayload) => {
    console.debug(`🔔 REALTIME EVENT: ${payload.table} - ${payload.eventType} (${payload.recordId || "N/A"})`);

    // Check if we should sync this table
    if (!strategy.shouldSyncTable(payload.table)) {
      console.log(
        `⏭️  Skipping sync for ${payload.table} (not in sync strategy)`
      );
      return;
    }

    // Debounce sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      // console.debug("⏱️  Clearing previous sync timeout");
    }

    console.debug(`⏱️  Scheduling sync for ${payload.table} in 500ms...`);
    syncTimeoutRef.current = setTimeout(() => {
      if (payload.eventType === "DELETE" && payload.recordId) {
        console.debug(
          `🗑️  Handling DELETE event for ${payload.table}/${payload.recordId}`
        );
        handleDelete(payload.table, payload.recordId);
      } else {
        console.debug(
          `🔄 Handling ${payload.eventType} event - syncing ${payload.table}`
        );
        syncTable(payload.table);
      }
    }, 500);
  };

  // Handle delete event
  const handleDelete = useCallback(
    async (tableName: string, recordId: string) => {
      if (!syncEngineRef.current) {
        console.warn(`⚠️  Cannot handle delete - sync engine not initialized`);
        return;
      }

      try {
        console.debug(`🗑️  DELETING RECORD: ${tableName} / ${recordId}`);

        const table = (database as any)[tableName];
        if (table) {
          await table.delete(recordId);
          console.debug(`✅ Successfully deleted ${recordId} from ${tableName}`);
        } else {
          console.warn(`⚠️  Table ${tableName} not found in local database`);
        }
      } catch (error) {
        console.error(`❌ DELETE FAILED: ${tableName}`, error);
      }
    },
    [database]
  );

  // Listen to realtime events
  useEffect(() => {
    console.debug("🎧 Setting up realtime event listeners...");

    const handleRealtimeChange = (event: Event) => {
      // console.debug("📨 Received window event:", event.type);
      const customEvent = event as CustomEvent<RealtimeEventPayload>;
      // console.debug("📦 Event payload:", customEvent.detail);
      if (handleRealtimeEventRef.current) {
        handleRealtimeEventRef.current(customEvent.detail);
      }
    };

    const handleReconnect = () => {
      console.debug("[RealtimeSync] Reconnected");
      if (isAutoSync) {
        // Check auth before syncing
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            console.debug("[RealtimeSync] Syncing after reconnect...");
            setTimeout(() => syncNow(), 1000);
          } else {
            console.debug("[RealtimeSync] No session, skipping sync");
          }
        });
      }
    };

    if (typeof window !== "undefined") {
      // Track listener count for debugging
      (window as any)._realtimeListenerCount =
        ((window as any)._realtimeListenerCount || 0) + 1;
      console.debug(
        `👂 Registering listener #${(window as any)._realtimeListenerCount}`
      );

      window.addEventListener(REALTIME_EVENT_NAME, handleRealtimeChange);
      window.addEventListener("mfc:realtime:reconnected", handleReconnect);
      console.debug(`✅ Event listeners registered for: ${REALTIME_EVENT_NAME}`);

      return () => {
        console.debug("🧹 Removing realtime event listeners...");
        (window as any)._realtimeListenerCount = Math.max(
          0,
          ((window as any)._realtimeListenerCount || 1) - 1
        );
        window.removeEventListener(REALTIME_EVENT_NAME, handleRealtimeChange);
        window.removeEventListener("mfc:realtime:reconnected", handleReconnect);
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
          syncTimeoutRef.current = null;
        }
      };
    }
  }, [syncNow, isAutoSync]); // Removed handleRealtimeEvent from dependencies

  // Monitor online/offline status
  useEffect(() => {
    const handleOffline = () => {
      console.debug("[RealtimeSync] Going offline");
      setIsOnline(false);
    };

    const handleOnline = () => {
      console.debug("[RealtimeSync] Back online");
      setIsOnline(true);
      if (isAutoSync) {
        // Check auth before syncing
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            console.debug("[RealtimeSync] Syncing after coming online...");
            setTimeout(() => syncNow(), 1000);
          } else {
            console.debug("[RealtimeSync] No session, skipping sync");
          }
        });
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      setIsOnline(navigator.onLine);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [isAutoSync, syncNow]);

  const value: RealtimeSyncContextType = {
    isSyncing,
    lastSyncTime,
    syncError,
    syncNow,
    syncTable,
    isOnline,
    isAutoSync,
    setIsAutoSync,
  };

  return (
    <RealtimeSyncContext.Provider value={value}>
      {children}
    </RealtimeSyncContext.Provider>
  );
}

/**
 * Hook to use realtime sync context
 */
export function useRealtimeSync(): RealtimeSyncContextType {
  const context = useContext(RealtimeSyncContext);
  if (context === undefined) {
    throw new Error(
      "useRealtimeSync must be used within a RealtimeSyncProvider"
    );
  }
  return context;
}
