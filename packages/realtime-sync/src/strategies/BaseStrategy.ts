/**
 * Base Strategy
 * Abstract base class for sync strategies
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MFCBillDeskDB } from '@mfc/database';
import type {
    ISyncStrategy,
    StrategyConfig,
    TableSyncConfig,
    RealtimeConfig,
    SyncQueryContext,
    SyncTransformContext,
} from '../types';
import { SyncError, SyncErrorCode } from '../types';

export abstract class BaseStrategy implements ISyncStrategy {
    protected supabase: SupabaseClient;
    protected db: MFCBillDeskDB;
    protected config: StrategyConfig;

    constructor(
        supabase: SupabaseClient,
        db: MFCBillDeskDB,
        config: StrategyConfig
    ) {
        this.supabase = supabase;
        this.db = db;
        this.config = config;
    }

    /**
     * Strip excluded columns from record
     */
    protected stripExcludedColumns(record: any): any {
        if (!this.config.excludeColumns) return record;

        const cleaned = { ...record };
        for (const col of this.config.excludeColumns) {
            delete cleaned[col];
        }
        // Remove joined data that shouldn't be stored
        delete cleaned.created_by_staff;
        return cleaned;
    }

    /**
     * Get list of tables to sync
     */
    getTablesToSync(): string[] {
        return Object.keys(this.config.tables).filter(
            (table) => this.config.tables[table]?.enabled
        );
    }

    /**
     * Get Supabase query for a specific table
     */
    getTableQuery(
        tableName: string,
        lastSync: string | null,
        context?: SyncQueryContext
    ): any {
        const tableConfig = this.config.tables[tableName];
        if (!tableConfig) {
            throw new SyncError(
                `Table ${tableName} not found in strategy configuration`,
                SyncErrorCode.TABLE_NOT_FOUND,
                tableName
            );
        }

        // Handle columns as string or array
        const columns = Array.isArray(tableConfig.columns)
            ? tableConfig.columns.join(', ')
            : tableConfig.columns;

        let query = this.supabase.from(tableName).select(columns);

        // Add incremental sync filter
        if (lastSync) {
            query = query.gt('updated_at', lastSync);
        }

        // Apply custom filters if defined
        if (tableConfig.filter) {
            query = tableConfig.filter(query, context);
        }

        return query;
    }

    /**
     * Transform a record before storing in IndexedDB
     */
    async transformRecord(tableName: string, record: any): Promise<any> {
        // First strip excluded columns
        let cleaned = this.stripExcludedColumns(record);

        const tableConfig = this.config.tables[tableName];
        if (!tableConfig || !tableConfig.transform) {
            return cleaned;
        }

        // Apply table-specific transform
        return tableConfig.transform(cleaned, this.getTransformContext());
    }

    /**
     * Get transform context
     * Override this in subclasses to provide custom context
     */
    protected abstract getTransformContext(): SyncTransformContext;

    /**
     * Get dependent tables that should be synced after this table
     */
    getDependentTables(tableName: string): string[] {
        const tableConfig = this.config.tables[tableName];
        return tableConfig?.dependsOn || [];
    }

    /**
     * Check if a table should be synced for this strategy
     */
    shouldSyncTable(tableName: string): boolean {
        return this.config.tables[tableName]?.enabled || false;
    }

    /**
     * Get realtime configuration
     */
    getRealtimeConfig(): RealtimeConfig {
        return this.config.realtime;
    }
}
