/**
 * Manager Strategy
 * Full access to all operational data for staff/manager applications
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MFCBillDeskDB } from '@mfc/database';
import type { StrategyConfig, SyncTransformContext } from '../types';
import { BaseStrategy } from './BaseStrategy';
import { NameCache } from '../utils/name-cache';
import {
    MANAGER_SHARED_SELECT_COLUMNS,
    transformChalan,
    transformDailyBill,
    transformQuote,
    transformQuoteItem,
    transformSaleTransaction,
    transformStockBatch,
    transformWithCreatedBy,
} from './managerShared';

export class ManagerStrategy extends BaseStrategy {
    private nameCache: NameCache;

    constructor(supabase: SupabaseClient, db: MFCBillDeskDB) {
        const config: StrategyConfig = {
            tables: {
                users: {
                    columns: MANAGER_SHARED_SELECT_COLUMNS.users,
                    enabled: true,
                },
                mfc_staff: {
                    columns: MANAGER_SHARED_SELECT_COLUMNS.mfc_staff,
                    enabled: true,
                },
                products: {
                    columns: MANAGER_SHARED_SELECT_COLUMNS.products,
                    enabled: true,
                    transform: transformWithCreatedBy,
                },
                stock_batches: {
                    columns: MANAGER_SHARED_SELECT_COLUMNS.stock_batches,
                    enabled: true,
                    transform: transformStockBatch,
                    dependsOn: ['products'],
                },
                daily_bills: {
                    columns: MANAGER_SHARED_SELECT_COLUMNS.daily_bills,
                    enabled: true,
                    transform: transformDailyBill,
                    dependsOn: ['users'],
                },
                sale_transactions: {
                    columns: MANAGER_SHARED_SELECT_COLUMNS.sale_transactions,
                    enabled: true,
                    transform: transformSaleTransaction,
                    dependsOn: ['daily_bills', 'chalans', 'products'],
                },
                chalans: {
                    columns: MANAGER_SHARED_SELECT_COLUMNS.chalans,
                    enabled: true,
                    transform: transformChalan,
                    dependsOn: ['users', 'mfc_staff'],
                },
                quotes: {
                    columns: MANAGER_SHARED_SELECT_COLUMNS.quotes,
                    enabled: true,
                    transform: transformQuote,
                    dependsOn: ['users'],
                },
                quote_items: {
                    columns: MANAGER_SHARED_SELECT_COLUMNS.quote_items,
                    enabled: true,
                    transform: transformQuoteItem,
                    dependsOn: ['quotes', 'products'],
                },
                customer_payments: {
                    columns: MANAGER_SHARED_SELECT_COLUMNS.customer_payments,
                    enabled: true,
                    transform: transformWithCreatedBy,
                    dependsOn: ['daily_bills'],
                },
                seller_payments: {
                    columns: MANAGER_SHARED_SELECT_COLUMNS.seller_payments,
                    enabled: true,
                    transform: transformWithCreatedBy,
                    dependsOn: ['chalans'],
                },
                manager_spendings: {
                    columns: MANAGER_SHARED_SELECT_COLUMNS.manager_spendings,
                    enabled: true,
                    transform: transformWithCreatedBy,
                    dependsOn: ['mfc_staff'],
                },
                customer_balance: {
                    columns: MANAGER_SHARED_SELECT_COLUMNS.customer_balance,
                    enabled: true,
                    dependsOn: ['users'],
                },
                seller_balance: {
                    columns: MANAGER_SHARED_SELECT_COLUMNS.seller_balance,
                    enabled: true,
                    dependsOn: ['users'],
                },
            },
            realtime: {
                // Use postgres_changes to listen directly to database changes
                channelName: 'manager-realtime',
                channelType: 'postgres_changes',
                tables: [
                    'users',
                    'mfc_staff',
                    'products',
                    'stock_batches',
                    'daily_bills',
                    'sale_transactions',
                    'chalans',
                    'quotes',
                    'quote_items',
                    'customer_payments',
                    'seller_payments',
                    'manager_spendings',
                    'customer_balance',
                    'seller_balance',
                ],
            },
            excludeColumns: [
                // Audit fields - not needed in local storage
                'created_at',
                'updated_by',

                // Auth fields - not needed in local storage
                'auth_user_id',

                // Media fields - too large for IndexedDB
                'profile_photo_url',

                // Note: We keep updated_at for sync tracking
            ],
        };

        super(supabase, db, config);
        this.nameCache = new NameCache();
    }

    protected getTransformContext(): SyncTransformContext {
        return {
            supabase: this.supabase,
            db: this.db,
            cache: this.nameCache as unknown as Map<string, any>,
        };
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.nameCache.clear();
    }

    /**
     * Get cache stats
     */
    getCacheStats() {
        return this.nameCache.getStats();
    }
}

/**
 * Factory function
 */
export function createManagerStrategy(
    supabase: SupabaseClient,
    db: MFCBillDeskDB
): ManagerStrategy {
    return new ManagerStrategy(supabase, db);
}
