/**
 * Realtime Sync Manager
 * 
 * Manages Supabase realtime subscriptions and propagates changes to IndexedDB
 */

import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { MFCBillDeskDB } from '@mfc/database';

interface RealtimeConfig {
    tables: string[];
    onUpdate?: (table: string, record: any) => void;
    onInsert?: (table: string, record: any) => void;
    onDelete?: (table: string, record: any) => void;
}

export class RealtimeManager {
    private supabase: SupabaseClient;
    private indexedDB: MFCBillDeskDB;
    private channels: Map<string, RealtimeChannel>;
    private config: RealtimeConfig;
    private debounceTimers: Map<string, NodeJS.Timeout>;

    constructor(
        supabase: SupabaseClient,
        indexedDB: MFCBillDeskDB,
        config: RealtimeConfig
    ) {
        this.supabase = supabase;
        this.indexedDB = indexedDB;
        this.config = config;
        this.channels = new Map();
        this.debounceTimers = new Map();
    }

    /**
     * Initialize realtime subscriptions for all configured tables
     */
    async initialize(): Promise<void> {
        for (const table of this.config.tables) {
            await this.subscribeToTable(table);
        }
    }

    /**
     * Subscribe to changes on a specific table
     */
    private async subscribeToTable(table: string): Promise<void> {
        const channel = this.supabase
            .channel(`${table}_changes`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table,
                },
                (payload) => this.handleChange(table, payload)
            )
            .subscribe();

        this.channels.set(table, channel);
    }

    /**
     * Handle realtime change event
     */
    private handleChange(table: string, payload: any): void {
        // Debounce to prevent excessive updates
        this.debounce(table, () => {
            switch (payload.eventType) {
                case 'INSERT':
                    this.handleInsert(table, payload.new);
                    break;
                case 'UPDATE':
                    this.handleUpdate(table, payload.new);
                    break;
                case 'DELETE':
                    this.handleDelete(table, payload.old);
                    break;
            }
        }, 500);
    }

    /**
     * Handle insert event
     */
    private async handleInsert(table: string, record: any): Promise<void> {
        try {
            const dbTable = (this.indexedDB as any)[table];
            await dbTable.put(record);

            if (this.config.onInsert) {
                this.config.onInsert(table, record);
            }
        } catch (error) {
            console.error(`Failed to handle insert for ${table}:`, error);
        }
    }

    /**
     * Handle update event
     */
    private async handleUpdate(table: string, record: any): Promise<void> {
        try {
            const dbTable = (this.indexedDB as any)[table];
            await dbTable.put(record);

            if (this.config.onUpdate) {
                this.config.onUpdate(table, record);
            }
        } catch (error) {
            console.error(`Failed to handle update for ${table}:`, error);
        }
    }

    /**
     * Handle delete event
     */
    private async handleDelete(table: string, record: any): Promise<void> {
        try {
            const dbTable = (this.indexedDB as any)[table];
            await dbTable.delete(record.id);

            if (this.config.onDelete) {
                this.config.onDelete(table, record);
            }
        } catch (error) {
            console.error(`Failed to handle delete for ${table}:`, error);
        }
    }

    /**
     * Debounce function to prevent excessive updates
     */
    private debounce(key: string, fn: () => void, delay: number): void {
        const existing = this.debounceTimers.get(key);
        if (existing) {
            clearTimeout(existing);
        }

        const timer = setTimeout(() => {
            fn();
            this.debounceTimers.delete(key);
        }, delay);

        this.debounceTimers.set(key, timer);
    }

    /**
     * Cleanup all subscriptions
     */
    async cleanup(): Promise<void> {
        for (const [table, channel] of this.channels.entries()) {
            await this.supabase.removeChannel(channel);
        }
        this.channels.clear();

        // Clear debounce timers
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
    }
}
