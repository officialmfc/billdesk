/**
 * Data Access Client
 *
 * Unified interface for querying, mutating, and subscribing to data
 * across IndexedDB and Supabase with automatic caching and sync.
 */

import type { MFCBillDeskDB } from '@mfc/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CacheManager, generateCacheKey } from './cache';
import type {
    DataAccessConfig,
    MutationOptions,
    QueryOptions,
    Subscription,
    SubscriptionOptions,
} from './types';
import {
    DataAccessError,
    NetworkError,
    PermissionError,
    ValidationError,
} from './types';

export class DataAccessClient {
    private supabase: SupabaseClient;
    private indexedDB: MFCBillDeskDB;
    public cache: CacheManager;
    private defaultCacheTTL: number;
    private enableSync: boolean;
    private enableRealtime: boolean;
    private subscriptions: Map<string, Set<Function>>;
    private isOnline: boolean;

    constructor(config: DataAccessConfig) {
        console.debug('[DataAccessClient] Constructor called with config:', {
            hasSupabase: !!config.supabase,
            hasIndexedDB: !!config.indexedDB,
            indexedDBType: config.indexedDB?.constructor?.name,
            indexedDBKeys: config.indexedDB ? Object.keys(config.indexedDB).filter(k => !k.startsWith('_')).slice(0, 5) : [],
        });

        this.supabase = config.supabase;
        this.indexedDB = config.indexedDB;
        this.cache = new CacheManager();
        this.defaultCacheTTL = config.defaultCacheTTL || 30000;
        this.enableSync = config.enableSync !== false;
        this.enableRealtime = config.enableRealtime !== false;
        this.subscriptions = new Map();
        this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

        if (!this.indexedDB) {
            console.error('[DataAccessClient] IndexedDB is undefined!');
        }

        // Listen to online/offline events
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                this.isOnline = true;
                this.handleOnline();
            });
            window.addEventListener('offline', () => {
                this.isOnline = false;
            });
        }

        // Set up database change listener
        this.setupDatabaseListener();
    }

    /**
     * Set up listener for database changes from external sources (like sync)
     */
    private setupDatabaseListener(): void {
        // Listen for custom events dispatched by sync engine
        if (typeof window !== 'undefined') {
            window.addEventListener('indexeddb-updated', ((event: CustomEvent) => {
                const { table } = event.detail;
                if (table && this.subscriptions.has(table)) {
                    // Invalidate cache and notify subscribers
                    this.cache.invalidate(`${table}:*`).catch(() => { });

                    // Query fresh data and notify subscribers
                    this.queryIndexedDB(table, {})
                        .then((data) => {
                            this.notifySubscribers(table, data);
                        })
                        .catch((error) => {
                            console.warn(`Failed to query ${table} after update:`, error);
                        });
                }
            }) as EventListener);
        }
    }

    /**
     * Query data with automatic caching and sync
     *
     * 1. Check cache first
     * 2. If cache miss, query IndexedDB
     * 3. If online, sync with Supabase in background
     * 4. Return data with subscription for updates
     */
    async query<T>(table: string, options: QueryOptions<T> = {}): Promise<T[]> {
        // Check if query is enabled
        if (options.enabled === false) {
            console.debug(`[DataAccess] Query disabled for ${table}`);
            return [];
        }

        const cacheKey = generateCacheKey(table, options);
        const cacheTTL = options.cacheTTL || this.defaultCacheTTL;

        // 1. Check cache first
        const cached = await this.cache.get<T[]>(cacheKey);
        if (cached) {
            console.debug(`[DataAccess] Cache hit for ${table}:`, cached.length, 'records');
            return cached;
        }

        try {
            // 2. Query IndexedDB
            let data = await this.queryIndexedDB<T>(table, options);
            console.debug(`[DataAccess] IndexedDB query for ${table}:`, data.length, 'records');

            // 3. If online, sync with Supabase in background
            if (this.isOnline && this.enableSync) {
                this.syncFromSupabase<T>(table, options).then((remoteData) => {
                    if (remoteData && remoteData.length > 0) {
                        // Update cache with fresh data
                        this.cache.set(cacheKey, remoteData, cacheTTL);
                        // Notify subscribers
                        this.notifySubscribers(table, remoteData);
                    }
                }).catch((error) => {
                    console.error(`Background sync failed for ${table}:`, error);
                });
            }

            // Cache the IndexedDB result
            await this.cache.set(cacheKey, data, cacheTTL);

            return data;
        } catch (error) {
            throw this.handleError(error, 'query', table);
        }
    }

    /**
     * Mutate data with optimistic updates
     *
     * 1. Apply optimistic update to cache
     * 2. Write to IndexedDB immediately
     * 3. Queue for Supabase sync
     * 4. Handle conflicts on sync
     */
    async mutate<T>(
        table: string,
        options: MutationOptions<T>
    ): Promise<T | T[]> {
        try {
            let result: T | T[];

            switch (options.operation) {
                case 'insert':
                    result = await this.insert<T>(table, options.data!);
                    break;
                case 'update':
                    result = await this.update<T>(table, options);
                    break;
                case 'delete':
                    result = await this.delete<T>(table, options);
                    break;
                default:
                    throw new Error(`Unknown operation: ${options.operation}`);
            }

            // Invalidate cache for this table
            await this.cache.invalidate(`${table}:*`);

            // Re-query and notify subscribers with fresh data
            const freshData = await this.queryIndexedDB<T>(table, {});
            this.notifySubscribers(table, freshData);

            return result;
        } catch (error) {
            throw this.handleError(error, 'mutate', table);
        }
    }

    /**
     * Subscribe to real-time updates
     */
    subscribe<T>(
        table: string,
        options: SubscriptionOptions<T> = {}
    ): Subscription {
        const subscriptionId = `${table}:${Date.now()}`;

        if (!this.subscriptions.has(table)) {
            this.subscriptions.set(table, new Set());
        }

        const callback = (data: T[] | null) => {
            if (options.onData && data) {
                // Apply where filter if provided
                let filteredData = data;
                if (options.where) {
                    filteredData = data.filter((item) => {
                        return Object.entries(options.where!).every(
                            ([key, value]) => (item as any)[key] === value
                        );
                    });
                }
                options.onData(filteredData);
            }
        };

        this.subscriptions.get(table)!.add(callback);

        // Initial data fetch
        if (options.onLoading) {
            options.onLoading(true);
        }

        this.query<T>(table, options as QueryOptions<T>)
            .then((data) => {
                console.debug(`[DataAccess] Initial query for ${table}:`, data.length, 'records');
                callback(data);
                if (options.onLoading) {
                    options.onLoading(false);
                }
            })
            .catch((error) => {
                console.error(`[DataAccess] Query error for ${table}:`, error);
                if (options.onError) {
                    options.onError(error);
                }
                if (options.onLoading) {
                    options.onLoading(false);
                }
            });

        // Return unsubscribe function
        return {
            unsubscribe: () => {
                const subs = this.subscriptions.get(table);
                if (subs) {
                    subs.delete(callback);
                    if (subs.size === 0) {
                        this.subscriptions.delete(table);
                    }
                }
            },
        };
    }

    /**
     * Query IndexedDB
     */
    private async queryIndexedDB<T>(
        table: string,
        options: QueryOptions<T>
    ): Promise<T[]> {
        if (!this.indexedDB) {
            console.error('[DataAccessClient] IndexedDB is undefined in queryIndexedDB');
            throw new Error('IndexedDB not initialized');
        }

        const dbTable = (this.indexedDB as any)[table];
        if (!dbTable) {
            console.warn(`[DataAccessClient] Table ${table} not found in IndexedDB. Available tables:`,
                Object.keys(this.indexedDB).filter(k => !k.startsWith('_')));
            return [];
        }

        console.debug(`[DataAccessClient] Querying table ${table} with options:`, options);

        let collection = dbTable.toCollection();

        // Apply where filter
        if (options.where) {
            if (typeof options.where === 'function') {
                collection = collection.filter(options.where);
            } else {
                // Simple equality filter
                const entries = Object.entries(options.where);
                if (entries.length > 0) {
                    const [key, value] = entries[0]!;
                    collection = dbTable.where(key).equals(value);
                }
            }
        }

        // Apply filters (more complex filtering)
        if (options.filters) {
            collection = collection.filter((item: any) => {
                return Object.entries(options.filters!).every(([key, condition]) => {
                    const value = item[key];

                    // Handle different filter operators
                    if (typeof condition === 'object' && condition !== null) {
                        // Handle operators like $ilike, $gt, $lt, etc.
                        if ('$ilike' in condition) {
                            const pattern = (condition as any).$ilike.replace(/%/g, '');
                            return value?.toLowerCase().includes(pattern.toLowerCase());
                        }
                        if ('$gt' in condition) {
                            return value > (condition as any).$gt;
                        }
                        if ('$gte' in condition) {
                            return value >= (condition as any).$gte;
                        }
                        if ('$lt' in condition) {
                            return value < (condition as any).$lt;
                        }
                        if ('$lte' in condition) {
                            return value <= (condition as any).$lte;
                        }
                        if ('$ne' in condition) {
                            return value !== (condition as any).$ne;
                        }
                        if ('$in' in condition) {
                            return (condition as any).$in.includes(value);
                        }
                    }

                    // Simple equality
                    return value === condition;
                });
            });
        }

        // Apply limit and offset before converting to array
        if (options.offset) {
            collection = collection.offset(options.offset);
        }
        if (options.limit) {
            collection = collection.limit(options.limit);
        }

        // Get the array
        let data = await collection.toArray();

        // Apply ordering in memory if needed
        if (options.orderBy) {
            let field: string;
            let direction: 'asc' | 'desc';

            // Handle both formats: string or { field, direction }
            if (typeof options.orderBy === 'object' && 'field' in options.orderBy) {
                field = options.orderBy.field;
                direction = options.orderBy.direction;
            } else {
                field = options.orderBy as string;
                direction = options.orderDirection || 'asc';
            }

            data.sort((a: any, b: any) => {
                const aVal = a[field];
                const bVal = b[field];

                if (aVal === bVal) return 0;
                if (aVal == null) return 1;
                if (bVal == null) return -1;

                const comparison = aVal < bVal ? -1 : 1;
                return direction === 'asc' ? comparison : -comparison;
            });
        }

        return data;
    }

    /**
     * Sync from Supabase
     */
    private async syncFromSupabase<T>(
        table: string,
        options: QueryOptions<T>
    ): Promise<T[] | null> {
        try {
            let query = this.supabase.from(table).select(
                options.select ? (Array.isArray(options.select) ? options.select.join(',') : options.select) : '*'
            );

            // Apply where filter
            if (options.where && typeof options.where !== 'function') {
                Object.entries(options.where).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }

            // Apply ordering
            if (options.orderBy) {
                let field: string;
                let direction: 'asc' | 'desc';

                // Handle both formats: string or { field, direction }
                if (typeof options.orderBy === 'object' && 'field' in options.orderBy) {
                    field = options.orderBy.field;
                    direction = options.orderBy.direction;
                } else {
                    field = options.orderBy as string;
                    direction = options.orderDirection || 'asc';
                }

                query = query.order(field, {
                    ascending: direction === 'asc',
                });
            }

            // Apply limit and offset
            if (options.limit) {
                query = query.limit(options.limit);
            }
            if (options.offset) {
                query = query.range(
                    options.offset,
                    options.offset + (options.limit || 50) - 1
                );
            }

            const { data, error } = await query;

            if (error) {
                throw error;
            }

            // Update IndexedDB with fresh data
            if (data && data.length > 0) {
                const dbTable = (this.indexedDB as any)[table];
                await dbTable.bulkPut(data);
            }

            return data as T[];
        } catch (error) {
            console.error(`Supabase sync failed for ${table}:`, error);
            return null;
        }
    }

    /**
     * Insert data
     */
    private async insert<T>(table: string, data: Partial<T> | Partial<T>[]): Promise<T | T[]> {
        const isArray = Array.isArray(data);
        const records = isArray ? data : [data];

        // Insert into IndexedDB
        const dbTable = (this.indexedDB as any)[table];
        const ids = await dbTable.bulkAdd(records, { allKeys: true });

        // If online, sync to Supabase
        if (this.isOnline) {
            try {
                const { data: supabaseData, error } = await this.supabase
                    .from(table)
                    .insert(records)
                    .select();

                if (error) {
                    throw error;
                }

                // Update IndexedDB with server-generated IDs
                if (supabaseData) {
                    await dbTable.bulkPut(supabaseData);
                    return isArray ? (supabaseData as T[]) : (supabaseData[0] as T);
                }
            } catch (error) {
                console.error(`Supabase insert failed for ${table}:`, error);
                // Continue with IndexedDB result
            }
        }

        // Return IndexedDB result
        const insertedRecords = await dbTable.bulkGet(ids);
        return isArray ? insertedRecords : insertedRecords[0];
    }

    /**
     * Update data
     */
    private async update<T>(
        table: string,
        options: MutationOptions<T>
    ): Promise<T | T[]> {
        const dbTable = (this.indexedDB as any)[table];

        // Update in IndexedDB
        if (options.id) {
            await dbTable.update(options.id, options.data);
        } else if (options.where) {
            const records = await this.queryIndexedDB<T>(table, { where: options.where });
            for (const record of records) {
                await dbTable.update((record as any).id, options.data);
            }
        }

        // If online, sync to Supabase
        if (this.isOnline) {
            try {
                let query = this.supabase.from(table).update(options.data!);

                if (options.id) {
                    query = query.eq('id', options.id);
                } else if (options.where) {
                    Object.entries(options.where).forEach(([key, value]) => {
                        query = query.eq(key, value);
                    });
                }

                const { data: supabaseData, error } = await query.select();

                if (error) {
                    throw error;
                }

                if (supabaseData) {
                    await dbTable.bulkPut(supabaseData);
                    return supabaseData.length === 1 ? supabaseData[0] : supabaseData;
                }
            } catch (error) {
                console.error(`Supabase update failed for ${table}:`, error);
            }
        }

        // Return updated records from IndexedDB
        if (options.id) {
            return await dbTable.get(options.id);
        } else {
            return await this.queryIndexedDB<T>(table, { where: options.where });
        }
    }

    /**
     * Delete data
     */
    private async delete<T>(
        table: string,
        options: MutationOptions<T>
    ): Promise<T | T[]> {
        const dbTable = (this.indexedDB as any)[table];

        // Get records before deletion
        let recordsToDelete: T[];
        if (options.id) {
            const record = await dbTable.get(options.id);
            recordsToDelete = record ? [record] : [];
        } else if (options.where) {
            recordsToDelete = await this.queryIndexedDB<T>(table, { where: options.where });
        } else {
            throw new Error('Delete requires either id or where clause');
        }

        // Delete from IndexedDB
        if (options.id) {
            await dbTable.delete(options.id);
        } else {
            const ids = recordsToDelete.map((r: any) => r.id);
            await dbTable.bulkDelete(ids);
        }

        // If online, sync to Supabase
        if (this.isOnline) {
            try {
                let query = this.supabase.from(table).delete();

                if (options.id) {
                    query = query.eq('id', options.id);
                } else if (options.where) {
                    Object.entries(options.where).forEach(([key, value]) => {
                        query = query.eq(key, value);
                    });
                }

                const { error } = await query;

                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error(`Supabase delete failed for ${table}:`, error);
            }
        }

        return recordsToDelete.length === 1 ? recordsToDelete[0]! : recordsToDelete;
    }

    /**
     * Notify subscribers of data changes
     */
    private notifySubscribers(table: string, data: any[] | null): void {
        const subs = this.subscriptions.get(table);
        if (subs) {
            subs.forEach((callback) => callback(data));
        }
    }

    /**
     * Handle online event
     */
    private handleOnline(): void {
        console.debug('Connection restored, syncing data...');
        // Trigger sync for all subscribed tables
        this.subscriptions.forEach((_, table) => {
            this.query(table).catch((error) => {
                console.error(`Sync failed for ${table}:`, error);
            });
        });
    }

    /**
     * Handle errors and convert to appropriate error types
     */
    private handleError(error: any, operation: string, table: string): DataAccessError {
        const message = error?.message || 'Unknown error occurred';

        // Network errors
        if (!this.isOnline || error?.message?.includes('network')) {
            return new NetworkError(
                `Network error during ${operation} on ${table}: ${message}`,
                error
            );
        }

        // Permission errors
        if (error?.code === '42501' || error?.message?.includes('permission')) {
            return new PermissionError(
                `Permission denied for ${operation} on ${table}: ${message}`,
                undefined,
                error
            );
        }

        // Validation errors
        if (error?.code === '23505' || error?.message?.includes('duplicate')) {
            return new ValidationError(
                `Validation error during ${operation} on ${table}: ${message}`,
                {},
                error
            );
        }

        // Generic error
        return new DataAccessError(
            `Error during ${operation} on ${table}: ${message}`,
            'UNKNOWN_ERROR',
            true,
            error
        );
    }

    /**
     * Cleanup resources
     */
    cleanup(): void {
        this.subscriptions.clear();
        this.cache.clear();
    }
}
