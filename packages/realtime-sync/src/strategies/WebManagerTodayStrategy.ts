import type { MFCBillDeskDB } from '@mfc/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { StrategyConfig, SyncQueryContext, SyncTransformContext } from '../types';
import { BaseStrategy } from './BaseStrategy';
import {
    MANAGER_SHARED_SELECT_COLUMNS,
    transformChalan,
    transformDailyBill,
    transformSaleTransaction,
    transformStockBatch,
    transformWithCreatedBy,
} from './managerShared';
import { NameCache } from '../utils/name-cache';

function getKolkataTodayDate(): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    return formatter.format(new Date());
}

export class WebManagerTodayStrategy extends BaseStrategy {
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
                    dependsOn: ['products', 'users', 'mfc_staff'],
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
            },
            realtime: {
                channelName: 'web-manager-realtime',
                channelType: 'postgres_changes',
                tables: [
                    'users',
                    'mfc_staff',
                    'products',
                    'stock_batches',
                    'daily_bills',
                    'sale_transactions',
                    'chalans',
                    'customer_payments',
                    'seller_payments',
                ],
            },
            excludeColumns: [
                'created_at',
                'updated_by',
                'auth_user_id',
                'profile_photo_url',
                'bill_scope',
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

    override getTableQuery(
        tableName: string,
        lastSync: string | null,
        context?: SyncQueryContext
    ): any {
        const today = getKolkataTodayDate();

        if (tableName === 'sale_transactions') {
            const columns = [
                ...MANAGER_SHARED_SELECT_COLUMNS.sale_transactions,
                'bill_scope:daily_bills!inner(bill_date)',
            ].join(', ');

            let query = this.supabase
                .from('sale_transactions')
                .select(columns)
                .eq('bill_scope.bill_date', today);

            if (lastSync) {
                query = query.gt('updated_at', lastSync);
            }

            return query;
        }

        let query = super.getTableQuery(tableName, lastSync, context);

        if (tableName === 'daily_bills') {
            query = query.eq('bill_date', today);
        } else if (tableName === 'chalans') {
            query = query.eq('chalan_date', today);
        } else if (tableName === 'customer_payments') {
            query = query.eq('payment_date', today);
        } else if (tableName === 'seller_payments') {
            query = query.eq('payment_date', today);
        }

        return query;
    }

    clearCache(): void {
        this.nameCache.clear();
    }
}

export function createWebManagerTodayStrategy(
    supabase: SupabaseClient,
    db: MFCBillDeskDB
): WebManagerTodayStrategy {
    return new WebManagerTodayStrategy(supabase, db);
}
