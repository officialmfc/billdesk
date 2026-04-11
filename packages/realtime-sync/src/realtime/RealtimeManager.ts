/**
 * Realtime Manager
 * Handles Supabase realtime subscriptions and broadcasts changes
 */

import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import type {
  RealtimeConfig,
  RealtimeEventPayload,
  SyncQueryContext,
} from "../types";
import { SyncError, SyncErrorCode } from "../types";

export const REALTIME_EVENT_NAME = "mfc:realtime:change";

export interface RealtimeManagerConfig {
  supabaseClient: SupabaseClient;
  realtimeConfig: RealtimeConfig;
  context?: SyncQueryContext;
  onEvent?: (payload: RealtimeEventPayload) => void;
}

export class RealtimeManager {
  private supabase: SupabaseClient;
  private config: RealtimeConfig;
  private context?: SyncQueryContext;
  private channel?: RealtimeChannel;
  private onEvent?: (payload: RealtimeEventPayload) => void;

  constructor(config: RealtimeManagerConfig) {
    this.supabase = config.supabaseClient;
    this.config = config.realtimeConfig;
    this.context = config.context;
    this.onEvent = config.onEvent;
  }

  /**
   * Get channel name
   */
  private getChannelName(): string {
    if (typeof this.config.channelName === "function") {
      return this.config.channelName(this.context);
    }
    return this.config.channelName;
  }

  /**
   * Initialize realtime subscriptions
   */
  async initialize(): Promise<void> {
    try {
      const channelName = this.getChannelName();
      const channelType = this.config.channelType || "postgres_changes";

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔌 REALTIME INITIALIZATION STARTING");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`📺 Channel Name: ${channelName}`);
      console.log(`📡 Channel Type: ${channelType}`);
      console.log(`🔐 Auth Status:`, await this.supabase.auth.getSession());

      this.channel = this.supabase.channel(channelName);
      console.log("✅ Channel object created");

      if (channelType === "postgres_changes" && this.config.tables) {
        // Subscribe to postgres changes for each table individually (like debug page)
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📋 SETTING UP POSTGRES_CHANGES LISTENERS");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`Subscribing to ${this.config.tables.length} tables:`, this.config.tables);

        // Subscribe to each table individually (this is what works in debug page)
        this.config.tables.forEach((table) => {
          console.log(`📋 Registering listener for table: ${table}`);
          this.channel!.on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: table,
            },
            (payload: any) => {
              console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
              console.log("🎯🎯🎯 POSTGRES_CHANGES CALLBACK FIRED! 🎯🎯🎯");
              console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
              console.log(`📋 Table: ${payload.table}`);
              console.log(`⚡ Event: ${payload.eventType}`);
              this.handlePostgresChange(payload);
            }
          );
        });

        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(
          `✅ ${this.config.tables.length} POSTGRES_CHANGES LISTENERS REGISTERED`
        );
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      }

      // Subscribe to channel
      console.log("🚀 Calling channel.subscribe()...");
      this.channel.subscribe((status, err) => {
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📡 CHANNEL STATUS CHANGE");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`Status: ${status}`);

        if (err) {
          console.error("❌ Subscription error:", err);
          console.error("Error details:", JSON.stringify(err, null, 2));
        }

        if (status === "SUBSCRIBED") {
          console.log(`✅ Successfully subscribed to: ${channelName}`);
          console.log("🔍 Channel state:", this.channel?.state);
          console.log("🔍 Channel topic:", (this.channel as any)?.topic);
          console.log("🔍 Channel params:", (this.channel as any)?.params);

          // Log bindings to see registered listeners
          const bindings = (this.channel as any)?.bindings;
          if (bindings) {
            console.log("🔍 Registered bindings:");
            Object.keys(bindings).forEach((key) => {
              const binding = bindings[key];
              console.log(`   - ${key}: ${binding?.length || 0} listeners`);
            });
          }

          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          console.log("🎧 NOW LISTENING FOR EVENTS...");
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

          this.dispatchConnectedEvent();
        } else if (status === "CHANNEL_ERROR") {
          console.error(`❌ Error subscribing to ${channelName}`);
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
          this.dispatchDisconnectedEvent();
          this.dispatchReconnectEvent();
        } else if (status === "TIMED_OUT") {
          console.warn(`⏱️  Subscription timed out for ${channelName}`);
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
          this.dispatchDisconnectedEvent();
        } else if (status === "CLOSED") {
          console.log(`🔌 Channel closed: ${channelName}`);
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
          this.dispatchDisconnectedEvent();
        }
      });
    } catch (error) {
      throw new SyncError(
        "Failed to initialize realtime subscriptions",
        SyncErrorCode.REALTIME_ERROR,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Handle postgres change event
   */
  private handlePostgresChange(payload: any): void {
    console.log("🎉 POSTGRES EVENT RECEIVED IN REALTIME MANAGER!");
    console.log("Raw payload:", payload);

    const eventType = payload.eventType as "INSERT" | "UPDATE" | "DELETE";
    const table = payload.table;
    const recordId = payload.new?.id || payload.old?.id;

    console.log(
      `📡 Postgres change: ${eventType} on ${table} (${recordId || "unknown"})`
    );

    const realtimePayload: RealtimeEventPayload = {
      table,
      eventType,
      recordId,
      schema: payload.schema,
      timestamp: new Date().toISOString(),
    };

    console.log("📤 Dispatching event to window...");

    // Dispatch custom event
    this.dispatchEvent(realtimePayload);

    // Call callback if provided
    this.onEvent?.(realtimePayload);

    console.log("✅ Event dispatched successfully");
  }

  /**
   * Dispatch custom event to window
   */
  private dispatchEvent(payload: RealtimeEventPayload): void {
    if (typeof window !== "undefined") {
      console.log("🚀 Dispatching to window:", REALTIME_EVENT_NAME, payload);
      console.log("🔍 Window object exists:", !!window);
      console.log("🔍 Window.dispatchEvent exists:", !!window.dispatchEvent);

      const event = new CustomEvent(REALTIME_EVENT_NAME, {
        detail: payload,
      });
      window.dispatchEvent(event);
      console.log("✅ Event dispatched to window");

      // Test if anyone is listening
      const listenerCount = (window as any)._realtimeListenerCount || 0;
      console.log(`👂 Estimated listeners: ${listenerCount}`);

      // Also dispatch connection status
      const connectionEvent = new CustomEvent("mfc:realtime:connection", {
        detail: { connected: true },
      });
      window.dispatchEvent(connectionEvent);
    } else {
      console.error("❌ Window is undefined - cannot dispatch events!");
    }
  }

  /**
   * Dispatch connected event
   */
  private dispatchConnectedEvent(): void {
    if (typeof window !== "undefined") {
      console.log("🟢 Dispatching connected event");
      const event = new CustomEvent("mfc:realtime:connection", {
        detail: { connected: true },
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Dispatch disconnected event
   */
  private dispatchDisconnectedEvent(): void {
    if (typeof window !== "undefined") {
      console.log("🔴 Dispatching disconnected event");
      const event = new CustomEvent("mfc:realtime:connection", {
        detail: { connected: false },
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Dispatch reconnect event
   */
  private dispatchReconnectEvent(): void {
    if (typeof window !== "undefined") {
      console.log("🔄 Dispatching reconnect event");
      const event = new CustomEvent("mfc:realtime:reconnected");
      window.dispatchEvent(event);
    }
  }

  /**
   * Cleanup subscriptions
   */
  async cleanup(): Promise<void> {
    if (this.channel) {
      await this.supabase.removeChannel(this.channel);
      console.log("🔌 Realtime channel removed");
      this.channel = undefined;
    }
  }

  /**
   * Get channel status
   */
  getStatus(): string | undefined {
    return this.channel?.state;
  }
}

/**
 * Factory function to create a realtime manager
 */
export function createRealtimeManager(
  config: RealtimeManagerConfig
): RealtimeManager {
  return new RealtimeManager(config);
}
