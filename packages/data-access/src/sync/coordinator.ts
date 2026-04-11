/**
 * Sync Coordinator
 * 
 * Manages bidirectional synchronization between IndexedDB and Supabase
 * with conflict resolution and batch processing
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MFCBillDeskDB } from '@mfc/database';
import type { SyncResult } from '../types';
import { ConflictResolver } from './conflict-resolver';
import { SyncQueue } from './queue';

interface SyncTimestamp {
    table: string;
    lastSync: number;
}

interface SyncProgress {
    table: string;
    recordsProcessed: number;
    totalRecords: number;
    status: 'syncing' | 'completed' | 'failed';
}

export class SyncCoordinator {
    private supabase: SupabaseClient;
    private indexedDB: MFCBillDeskDB;
    private conflictResolver: ConflictResolver;
    private queue: SyncQueue;
    private syncTimestamps: Map<string, number>;
    private isSyncing: boolean;
    private onProgress?: (progress: SyncProgress) => void;

    constructor(
        supabase: SupabaseClient,
        indexedDB: MFCBillDeskDB,
        onProgress?: (progress: SyncProgress) => void
    ) {
        this.supabase = supabase;
        this.indexedDB = indexedDB;
        this.conflictResolver = new ConflictResolver();
        this.queue = new SyncQueue(indexedDB);
        this.syncTimestamps = new Map();
        this.isSyncing = false;
        this.onProgress = onProgress;

        // Load sync timestamps from localStorage
        this.loadSyncTimestamps();
    }

    /**
     * Sync a specific table bidirectionally
     * 
     * 1. Get last sync timestamp
     * 2. Fetch changes from Supabase since last sync
     * 3. Fetch local changes from IndexedDB
     * 4. Resolve conflicts
     * 5. Apply changes bidirectionally
     * 6. Update sync timestamp
     */
    async syncTable(table: string): Promise<SyncResult> {
        if (this.isSyncing) {
            throw new Error('Sync already in progress');
        }

        this.isSyncing = true;
        const errors: Error[] = [];
        let recordsProcessed = 0;

        try {
            // 1. Get last sync timestamp
            const lastSync = this.syncTimestamps.get(table) || 0;
            const lastSyncDate = new Date(lastSync).toISOString();

            this.reportProgress(table, 0, 0, 'syncing');

            // 2. Fetch changes from Supabase since last sync
            const { data: remoteChanges, error: remoteError } = await this.supabase
                .from(table)
                .select('*')
                .gte('updated_at', lastSyncDate)
                .order('updated_at', { ascending: true });

            if (remoteError) {
                errors.push(new Error(`Failed to fetch remote changes: ${remoteError.message}`));
            }

            // 3. Fetch local changes from IndexedDB
            const dbTable = (this.indexedDB as any)[table];
            const localRecords = await dbTable
                .where('updated_at')
                .above(lastSyncDate)
                .toArray();

            // 4. Resolve conflicts
            const { toLocal, toRemote } = await this.conflictResolver.resolve(
                localRecords,
                remoteChanges || [],
                table
            );

            const totalRecords = toLocal.length + toRemote.length;
            this.reportProgress(table, 0, totalRecords, 'syncing');

            // 5. Apply changes to IndexedDB
            if (toLocal.length > 0) {
                await this.applyToIndexedDB(table, toLocal);
                recordsProcessed += toLocal.length;
                this.reportProgress(table, recordsProcessed, totalRecords, 'syncing');
            }

            // 6. Apply changes to Supabase
            if (toRemote.length > 0) {
                await this.applyToSupabase(table, toRemote);
                recordsProcessed += toRemote.length;
                this.reportProgress(table, recordsProcessed, totalRecords, 'syncing');
            }

            // 7. Update sync timestamp
            this.syncTimestamps.set(table, Date.now());
            this.saveSyncTimestamps();

            this.reportProgress(table, recordsProcessed, totalRecords, 'completed');

            return {
                success: true,
                table,
                recordsProcessed,
                errors,
            };
        } catch (error) {
            errors.push(error as Error);
            this.reportProgress(table, recordsProcessed, recordsProcessed, 'failed');

            return {
                success: false,
                table,
                recordsProcessed,
                errors,
            };
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Sync all tables
     */
    async syncAll(tables: string[]): Promise<SyncResult[]> {
        const results: SyncResult[] = [];

        for (const table of tables) {
            try {
                const result = await this.syncTable(table);
                results.push(result);
            } catch (error) {
                results.push({
                    success: false,
                    table,
                    recordsProcessed: 0,
                    errors: [error as Error],
                });
            }
        }

        return results;
    }

    /**
     * Apply changes to IndexedDB in batches
     */
    private async applyToIndexedDB(
        table: string,
        records: any[]
    ): Promise<void> {
        const dbTable = (this.indexedDB as any)[table];
        const batchSize = 100;

        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            await dbTable.bulkPut(batch);
        }
    }

    /**
     * Apply changes to Supabase in batches
     */
    private async applyToSupabase(
        table: string,
        records: any[]
    ): Promise<void> {
        const batchSize = 100;

        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);

            // Use upsert to handle both inserts and updates
            const { error } = await this.supabase
                .from(table)
                .upsert(batch, { onConflict: 'id' });

            if (error) {
                throw new Error(`Failed to sync batch to Supabase: ${error.message}`);
            }
        }
    }

    /**
     * Process offline queue
     */
    async processQueue(): Promise<void> {
        const items = await this.queue.getAll();

        for (const item of items) {
            try {
                await this.queue.markSyncing(item.id);

                // Apply to Supabase
                let query;
                switch (item.operation) {
                    case 'insert':
                        query = this.supabase.from(item.table).insert(item.data);
                        break;
                    case 'update':
                        query = this.supabase.from(item.table).update(item.data).eq('id', item.data.id);
                        break;
                    case 'delete':
                        query = this.supabase.from(item.table).delete().eq('id', item.data.id);
                        break;
                }

                const { error } = await query;

                if (error) {
                    throw error;
                }

                await this.queue.markCompleted(item.id);
            } catch (error) {
                await this.queue.markFailed(item.id, (error as Error).message);
            }
        }
    }

    /**
     * Get sync status
     */
    getSyncStatus(table: string): { lastSync: number; isSyncing: boolean } {
        return {
            lastSync: this.syncTimestamps.get(table) || 0,
            isSyncing: this.isSyncing,
        };
    }

    /**
     * Reset sync timestamp for a table
     */
    resetSyncTimestamp(table: string): void {
        this.syncTimestamps.delete(table);
        this.saveSyncTimestamps();
    }

    /**
     * Load sync timestamps from localStorage
     */
    private loadSyncTimestamps(): void {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem('mfc_sync_timestamps');
            if (stored) {
                const timestamps = JSON.parse(stored);
                this.syncTimestamps = new Map(Object.entries(timestamps));
            }
        } catch (error) {
            console.error('Failed to load sync timestamps:', error);
        }
    }

    /**
     * Save sync timestamps to localStorage
     */
    private saveSyncTimestamps(): void {
        if (typeof window === 'undefined') return;

        try {
            const timestamps = Object.fromEntries(this.syncTimestamps);
            localStorage.setItem('mfc_sync_timestamps', JSON.stringify(timestamps));
        } catch (error) {
            console.error('Failed to save sync timestamps:', error);
        }
    }

    /**
     * Report sync progress
     */
    private reportProgress(
        table: string,
        recordsProcessed: number,
        totalRecords: number,
        status: 'syncing' | 'completed' | 'failed'
    ): void {
        if (this.onProgress) {
            this.onProgress({
                table,
                recordsProcessed,
                totalRecords,
                status,
            });
        }
    }

    /**
     * Cleanup resources
     */
    cleanup(): void {
        this.syncTimestamps.clear();
    }
}
