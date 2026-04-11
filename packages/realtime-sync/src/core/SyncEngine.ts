/**
 * Core Sync Engine
 * Handles bidirectional synchronization between IndexedDB and Supabase
 */

import type { MFCBillDeskDB } from '@mfc/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
    ISyncStrategy,
    SyncMetrics,
    SyncProgress,
    SyncQueryContext,
    SyncServiceConfig,
    SyncTransformContext,
} from '../types';
import { SyncError, SyncErrorCode } from '../types';
import { NameCache } from '../utils/name-cache';
import { PerformanceMonitor } from '../utils/performance-monitor';
import { RetryStrategy } from '../utils/retry-strategy';

export class SyncEngine {
    private supabase: SupabaseClient;
    private db: MFCBillDeskDB;
    private strategy: ISyncStrategy;
    private context?: SyncQueryContext;
    private isSyncing = false;
    private retryStrategy: RetryStrategy;
    private perfMonitor: PerformanceMonitor;
    private nameCache: NameCache;

    /**
     * Get last sync time for a table
     */
    private async getLastSyncTime(tableName: string): Promise<string | null> {
        try {
            const metadata = await this.db.sync_metadata
                .where('table_name')
                .equals(tableName)
                .first();
            return metadata?.last_sync || null;
        } catch (error) {
            console.warn(`Failed to get last sync time for ${tableName}:`, error);
            return null;
        }
    }

    /**
     * Update sync metadata for a table
     */
    private async updateSyncMetadata(
        tableName: string,
        status: 'idle' | 'syncing' | 'error',
        errorMessage?: string,
        lastSync?: string
    ): Promise<void> {
        try {
            if (!tableName || typeof tableName !== 'string') {
                console.warn(`Invalid table name provided: ${tableName}`);
                return;
            }

            const existing = await this.db.sync_metadata
                .where('table_name')
                .equals(tableName)
                .first();

            const now = new Date().toISOString();

            await this.db.sync_metadata.put({
                table_name: tableName,
                last_sync: lastSync || existing?.last_sync || now,
                status,
                error_message: errorMessage,
            });
        } catch (error) {
            console.error(`Failed to update sync metadata for ${tableName}:`, error);
        }
    }

    /**
     * Notify data access layer of database updates
     */
    private notifyDataUpdate(tableName: string): void {
        if (typeof window !== 'undefined') {
            // Use setTimeout to ensure the database write is complete
            setTimeout(() => {
                window.dispatchEvent(
                    new CustomEvent('indexeddb-updated', {
                        detail: { table: tableName },
                    })
                );
            }, 0);
        }
    }

    // Callbacks
    private onSyncStart?: () => void;
    private onSyncComplete?: () => void;
    private onSyncError?: (error: Error) => void;
    private onSyncProgress?: (progress: SyncProgress) => void;

    constructor(config: SyncServiceConfig) {
        this.supabase = config.supabaseClient;
        this.db = config.database;
        this.strategy = config.strategy;
        this.context = config.context;
        this.onSyncStart = config.onSyncStart;
        this.onSyncComplete = config.onSyncComplete;
        this.onSyncError = config.onSyncError;
        this.onSyncProgress = config.onSyncProgress;

        // Initialize utilities
        this.retryStrategy = new RetryStrategy({
            maxRetries: 3,
            baseDelay: 1000,
            onRetry: (attempt, error, delay) => {
                console.debug(
                    `🔄 Retry attempt ${attempt}/3 after ${delay}ms:`,
                    error.message
                );
            },
        });
        this.perfMonitor = new PerformanceMonitor();
        this.nameCache = new NameCache();
    }

    /**
     * Get primary key for a table
     */
    private getPrimaryKey(tableName: string): string {
        const primaryKeys: Record<string, string> = {
            customer_balance: 'user_id',
            seller_balance: 'user_id',
        };
        return primaryKeys[tableName] || 'id';
    }

    /**
     * Sync a specific table
     */
    async syncTable(tableName: string): Promise<void> {
        const timer = this.perfMonitor.startTimer(`sync_${tableName}`);

        try {
            // Validate table exists in IndexedDB
            const table = (this.db as any)[tableName];
            if (!table) {
                throw new SyncError(
                    `Table ${tableName} does not exist in IndexedDB schema. Available tables: ${Object.keys(
                        this.db.tables
                    ).join(', ')}`,
                    SyncErrorCode.TABLE_NOT_FOUND,
                    tableName
                );
            }

            console.debug(`🔄 Syncing table: ${tableName}`);

            // Get last sync time
            const lastSync = await this.getLastSyncTime(tableName);
            console.debug(`🔄 Syncing table: ${tableName}, lastSync: ${lastSync}`);

            // Get query from strategy
            const query = this.strategy.getTableQuery(
                tableName,
                lastSync,
                this.context
            );

            // Execute query with retry
            const result = await this.retryStrategy.executeWithRetry(
                () => query,
                `Fetch ${tableName}`
            );

            const { data, error } = result as { data: any[] | null; error: any };

            if (error) {
                throw new SyncError(
                    `Failed to fetch ${tableName}: ${error.message}`,
                    SyncErrorCode.NETWORK_ERROR,
                    tableName,
                    error
                );
            }

            if (!data || data.length === 0) {
                console.debug(`⚠️  No data to sync for ${tableName}`);
                timer();
                return;
            }

            console.debug(`✅ Received ${data.length} records for ${tableName}`);

            // Transform and separate active/deleted records
            const activeRecords: any[] = [];
            const deletedIds: string[] = [];
            const primaryKey = this.getPrimaryKey(tableName);

            for (const record of data) {
                const recordKey = record[primaryKey];
                if (!recordKey) {
                    console.warn(
                        `⚠️  Skipping record without ${primaryKey} in ${tableName}`
                    );
                    continue;
                }

                if (record.is_deleted) {
                    deletedIds.push(recordKey);
                } else {
                    const transformed = await this.strategy.transformRecord(
                        tableName,
                        record
                    );
                    activeRecords.push(transformed);
                }
            }

            // Bulk write to IndexedDB
            if (activeRecords.length > 0) {
                await this.retryStrategy.executeWithRetry(
                    () => table.bulkPut(activeRecords),
                    `Write ${tableName} to IndexedDB`
                );
                console.debug(`✅ Synced ${activeRecords.length} records for ${tableName}`);

                // Notify data access layer of changes
                this.notifyDataUpdate(tableName);
            }

            if (deletedIds.length > 0) {
                await this.retryStrategy.executeWithRetry(
                    () => table.bulkDelete(deletedIds),
                    `Delete ${tableName} from IndexedDB`
                );
                console.debug(
                    `🗑️  Deleted ${deletedIds.length} records from ${tableName}`
                );

                // Notify data access layer of changes
                this.notifyDataUpdate(tableName);
            }

            // Find latest updated_at
            let maxUpdatedAt = lastSync;

            for (const record of data) {
                if (record.updated_at) {
                    if (!maxUpdatedAt || new Date(record.updated_at) > new Date(maxUpdatedAt)) {
                        maxUpdatedAt = record.updated_at;
                    }
                }
            }

            if (maxUpdatedAt && maxUpdatedAt !== lastSync) {
                console.debug(`💾 Updating sync metadata for ${tableName} to ${maxUpdatedAt}`);
                await this.updateSyncMetadata(
                    tableName,
                    'idle',
                    undefined,
                    maxUpdatedAt
                );
            } else {
                console.warn(`⚠️ Could not determine new lastSync for ${tableName} (maxUpdatedAt: ${maxUpdatedAt})`);
            }

            // Sync dependent tables
            const dependentTables = this.strategy.getDependentTables(tableName);
            if (dependentTables.length > 0) {
                console.debug(`🔗 Syncing ${dependentTables.length} dependent tables...`);
                for (const depTable of dependentTables) {
                    await this.syncTable(depTable);
                }
            }

            timer();
        } catch (error) {
            timer();
            const syncError =
                error instanceof SyncError
                    ? error
                    : new SyncError(
                        `Error syncing table ${tableName}`,
                        SyncErrorCode.DATABASE_ERROR,
                        tableName,
                        error as Error
                    );
            console.error(`❌ Error syncing table ${tableName}:`, syncError);
            throw syncError;
        }
    }

    /**
     * Sync deleted records
     */
    async syncDeletedRecords(): Promise<void> {
        try {
            console.debug('🔄 Syncing deleted records...');

            const lastSync = await this.getLastSyncTime('deleted_records');

            let query = this.supabase
                .from('deleted_records')
                .select('*')
                .eq('synced_to_clients', false);

            if (lastSync) {
                query = query.gt('deleted_at', lastSync);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (!data || data.length === 0) {
                console.debug('⚠️  No deleted records to sync');
                return;
            }

            console.debug(`✅ Received ${data.length} deleted records`);

            // Group by table
            const deletionsByTable: Record<string, string[]> = {};

            for (const record of data) {
                if (!deletionsByTable[record.table_name]) {
                    deletionsByTable[record.table_name] = [];
                }
                deletionsByTable[record.table_name]!.push(record.record_id);
            }

            // Delete from IndexedDB and track successful deletions
            const successfulDeletionIds: string[] = [];

            for (const [tableName, recordIds] of Object.entries(deletionsByTable)) {
                if (this.strategy.shouldSyncTable(tableName)) {
                    const table = (this.db as any)[tableName];
                    if (table) {
                        try {
                            await table.bulkDelete(recordIds);
                            console.debug(
                                `🗑️  Deleted ${recordIds.length} records from ${tableName}`
                            );

                            // Track successful deletions
                            const successfulIds = data
                                .filter(
                                    (d) =>
                                        d.table_name === tableName &&
                                        recordIds.includes(d.record_id)
                                )
                                .map((d) => d.id);
                            successfulDeletionIds.push(...successfulIds);
                        } catch (error) {
                            console.error(
                                `❌ Failed to delete records from ${tableName}:`,
                                error
                            );
                        }
                    }
                }
            }

            // Only mark as synced if we successfully deleted from local DB
            if (successfulDeletionIds.length > 0) {
                await this.supabase
                    .from('deleted_records')
                    .update({ synced_to_clients: true })
                    .in('id', successfulDeletionIds);

                console.debug(
                    `✅ Marked ${successfulDeletionIds.length} deletion records as synced`
                );
            }

            // Update sync metadata
            if (data.length > 0) {
                const latestRecord = data.reduce((latest, record) => {
                    return new Date(record.deleted_at) > new Date(latest.deleted_at)
                        ? record
                        : latest;
                });

                await this.updateSyncMetadata(
                    'deleted_records',
                    'idle',
                    undefined,
                    latestRecord.deleted_at
                );
            }

            console.debug(`✅ Synced ${data.length} deleted records`);
        } catch (error) {
            console.error('❌ Error syncing deleted records:', error);
            throw new SyncError(
                'Failed to sync deleted records',
                SyncErrorCode.DATABASE_ERROR,
                'deleted_records',
                error as Error
            );
        }
    }

    /**
     * Full sync - sync all tables
     */
    private syncPromise: Promise<void> | null = null;

    /**
     * Full sync - sync all tables
     */
    async fullSync(): Promise<void> {
        if (this.syncPromise) {
            console.debug('🔄 Sync already in progress, attaching to existing sync...');
            return this.syncPromise;
        }

        this.isSyncing = true;
        this.onSyncStart?.();

        this.syncPromise = (async () => {
            const fullSyncTimer = this.perfMonitor.startTimer('full_sync');

            try {
                console.debug('🚀 Starting full sync...');

                const tables = this.strategy.getTablesToSync();
                console.debug(`📋 Syncing ${tables.length} tables`);

                // Group tables by dependencies
                const independentTables = tables.filter(
                    (table) => this.strategy.getDependentTables(table).length === 0
                );

                const dependentTables = tables.filter(
                    (table) => !independentTables.includes(table)
                );

                // Sync independent tables in parallel
                console.debug(
                    `📥 Syncing ${independentTables.length} independent tables in parallel...`
                );

                const syncPromises = independentTables.map(async (table, index) => {
                    await this.syncTable(table);
                    if (this.onSyncProgress) {
                        this.onSyncProgress({
                            currentTable: table,
                            totalTables: tables.length,
                            completedTables: index + 1,
                            recordCount: 0,
                        });
                    }
                });

                await Promise.allSettled(syncPromises);

                // Sync dependent tables sequentially
                console.debug(
                    `📥 Syncing ${dependentTables.length} dependent tables sequentially...`
                );

                for (let i = 0; i < dependentTables.length; i++) {
                    const table = dependentTables[i];
                    if (!table) continue;

                    try {
                        await this.syncTable(table);
                        if (this.onSyncProgress) {
                            this.onSyncProgress({
                                currentTable: table,
                                totalTables: tables.length,
                                completedTables: independentTables.length + i + 1,
                                recordCount: 0,
                            });
                        }
                    } catch (error) {
                        console.error(`❌ Error syncing ${table}:`, error);
                    }
                }

                // Sync deleted records
                await this.syncDeletedRecords();

                console.debug('✅ Full sync completed successfully');

                // Print performance report
                this.perfMonitor.report();

                this.onSyncComplete?.();
            } catch (error) {
                console.error('❌ Error during full sync:', error);
                const syncError =
                    error instanceof SyncError
                        ? error
                        : new SyncError(
                            'Full sync failed',
                            SyncErrorCode.DATABASE_ERROR,
                            undefined,
                            error as Error
                        );
                this.onSyncError?.(syncError);
                // Don't throw, just log and report error to ensure "non-breakable"
                // throw syncError;
            } finally {
                fullSyncTimer();
                this.isSyncing = false;
                this.syncPromise = null;
            }
        })();

        return this.syncPromise;
    }

    /**
     * Check if sync is in progress
     */
    isSyncInProgress(): boolean {
        return this.isSyncing;
    }

    /**
     * Check if online
     */
    isOnline(): boolean {
        return typeof navigator !== 'undefined' && navigator.onLine;
    }

    /**
     * Get sync metrics
     */
    getMetrics(): SyncMetrics[] {
        return this.perfMonitor.getMetrics();
    }

    /**
     * Get transform context for strategies
     */
    getTransformContext(): SyncTransformContext {
        return {
            supabase: this.supabase,
            db: this.db,
            cache: this.nameCache as unknown as Map<string, any>,
            userId: this.context?.userId,
        };
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.nameCache.clear();
    }

    /**
     * Cleanup resources
     */
    cleanup(): void {
        this.nameCache.clear();
        console.debug('🧹 Sync engine cleaned up');
    }
}

/**
 * Factory function to create a sync engine
 */
export function createSyncEngine(config: SyncServiceConfig): SyncEngine {
    return new SyncEngine(config);
}
