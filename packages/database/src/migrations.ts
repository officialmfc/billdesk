/**
 * Database Migration System
 * 
 * This module manages IndexedDB schema versioning and migrations using Dexie.js.
 * Each migration represents a schema version and includes upgrade logic.
 * 
 * Migration Guidelines:
 * - Never modify existing migrations - always create new ones
 * - Each migration must increment the version number
 * - Test migrations thoroughly before deploying
 * - Document breaking changes in migration descriptions
 * 
 * @package @mfc/database
 */
import type { MFCBillDeskDB } from './schema';

/**
 * Migration interface defining the structure of each migration
 */
export interface Migration {
    /** Schema version number (must be sequential) */
    version: number;
    /** Human-readable description of changes */
    description: string;
    /** Upgrade function that applies schema changes */
    up: (db: MFCBillDeskDB) => void;
    /** Optional data migration function for transforming existing data */
    migrate?: (db: MFCBillDeskDB) => Promise<void>;
}

/**
 * Migration history - All schema versions in chronological order
 * 
 * IMPORTANT: Never modify existing migrations. Always add new ones.
 */
export const migrations: Migration[] = [
    {
        version: 1,
        description: 'Initial schema - Legacy tables from original implementation',
        up: (db) => {
            db.version(1).stores({
                // Legacy schema (deprecated but kept for migration path)
                users: 'id, auth_user_id, user_role, full_name, updated_at',
                admins: 'id, auth_user_id, admin_role, full_name, updated_at',
                chalans: 'id, chalan_number, seller_id, date, updated_at',
                chalan_paid: 'id, chalan_id, paid_at, updated_at',
                vendor_sells: 'id, chalan_id, buyer_id, [buyer_id+date], updated_at',
                vendor_collections: 'id, user_id, [user_id+collection_date], updated_at',
                business_sells: 'id, buyer_id, [buyer_id+date], updated_at',
                business_collections: 'id, user_id, [user_id+collection_date], updated_at',
                mfc_sellers: 'id, user_id, is_default, updated_at',
                daily_purchase_summary: 'id, user_id, [user_id+date], date, updated_at',
                sync_metadata: 'table_name, last_sync, status',
                settings: 'key',
            });
        },
    },
    {
        version: 2,
        description: 'Refactored schema - Aligned with Supabase schema, optimized indexes',
        up: (db) => {
            db.version(2).stores({
                // User Management Tables
                users: 'id, auth_user_id, name, business_name, phone, user_type, default_role, is_active, updated_at',
                mfc_staff: 'id, full_name, role, is_active, updated_at',

                // Product & Inventory Tables
                products: 'id, name, is_stock_tracked, updated_at',
                stock_batches: 'id, product_id, batch_code, supplier_id, mfc_seller_id, updated_at',

                // Sales & Billing Tables
                daily_bills: 'id, bill_number, customer_id, [customer_id+bill_date], bill_date, status, updated_at',
                sale_transactions: 'id, daily_bill_id, chalan_id, product_id, stock_batch_id, sale_type, updated_at',
                chalans: 'id, chalan_number, seller_id, mfc_seller_id, [seller_id+chalan_date], chalan_date, status, updated_at',

                // Quotation Tables
                quotes: 'id, quote_number, customer_id, [customer_id+delivery_date], delivery_date, status, updated_at',
                quote_items: 'id, quote_id, product_id',

                // Payment Tables
                customer_payments: 'id, daily_bill_id, [daily_bill_id+payment_date], payment_date, updated_at',
                seller_payments: 'id, chalan_id, [chalan_id+payment_date], payment_date, updated_at',

                // Balance Tables (Aggregated Views)
                customer_balance: 'user_id, updated_at',
                seller_balance: 'user_id, updated_at',

                // Registration Table
                public_registrations: 'id, email, status, updated_at',

                // Metadata Tables
                sync_metadata: 'table_name, last_sync, status',
                settings: 'key',
            });
        },
        migrate: async (db) => {
            // Data migration logic for v1 -> v2
            // This would transform old table structures to new ones
            // For now, this is a placeholder for future implementation
            console.log('Migration v1 -> v2: Schema updated, data migration not required');
        },
    },
    {
        version: 3,
        description: 'Restore created_by columns and manager compound indexes for staff-owned sync data',
        up: (db) => {
            db.version(3).stores({
                users: 'id, auth_user_id, name, business_name, phone, user_type, default_role, is_active, updated_at',
                mfc_staff: 'id, full_name, role, is_active, updated_at',
                products: 'id, name, is_stock_tracked, created_by, updated_at',
                stock_batches: 'id, product_id, batch_code, supplier_id, mfc_seller_id, created_by, updated_at',
                daily_bills: 'id, bill_number, customer_id, [customer_id+bill_date], [created_by+bill_date], bill_date, created_by, status, updated_at',
                sale_transactions: 'id, daily_bill_id, chalan_id, product_id, stock_batch_id, sale_type, created_by, updated_at',
                chalans: 'id, chalan_number, seller_id, mfc_seller_id, [seller_id+chalan_date], [created_by+chalan_date], chalan_date, created_by, status, updated_at',
                quotes: 'id, quote_number, customer_id, [customer_id+delivery_date], [created_by+delivery_date], delivery_date, created_by, status, updated_at',
                quote_items: 'id, quote_id, product_id',
                customer_payments: 'id, daily_bill_id, [daily_bill_id+payment_date], [created_by+payment_date], payment_date, created_by, updated_at',
                seller_payments: 'id, chalan_id, [chalan_id+payment_date], [created_by+payment_date], payment_date, created_by, updated_at',
                customer_balance: 'user_id, updated_at',
                seller_balance: 'user_id, updated_at',
                public_registrations: 'id, email, status, updated_at',
                sync_metadata: 'table_name, last_sync, status',
                settings: 'key',
            });
        },
        migrate: async () => {
            console.log('Migration v2 -> v3: created_by fields are now persisted for manager-owned records');
        },
    },
    {
        version: 4,
        description: 'Add manager spendings to the synced manager read model',
        up: (db) => {
            db.version(4).stores({
                users: 'id, auth_user_id, name, business_name, phone, user_type, default_role, is_active, updated_at',
                mfc_staff: 'id, full_name, role, is_active, updated_at',
                products: 'id, name, is_stock_tracked, created_by, updated_at',
                stock_batches: 'id, product_id, batch_code, supplier_id, mfc_seller_id, created_by, updated_at',
                daily_bills: 'id, bill_number, customer_id, [customer_id+bill_date], [created_by+bill_date], bill_date, created_by, status, updated_at',
                sale_transactions: 'id, daily_bill_id, chalan_id, product_id, stock_batch_id, sale_type, created_by, updated_at',
                chalans: 'id, chalan_number, seller_id, mfc_seller_id, [seller_id+chalan_date], [created_by+chalan_date], chalan_date, created_by, status, updated_at',
                quotes: 'id, quote_number, customer_id, [customer_id+delivery_date], [created_by+delivery_date], delivery_date, created_by, status, updated_at',
                quote_items: 'id, quote_id, product_id',
                customer_payments: 'id, daily_bill_id, [daily_bill_id+payment_date], [created_by+payment_date], payment_date, created_by, updated_at',
                seller_payments: 'id, chalan_id, [chalan_id+payment_date], [created_by+payment_date], payment_date, created_by, updated_at',
                manager_spendings: 'id, spent_date, [created_by+spent_date], category, created_by, updated_at',
                customer_balance: 'user_id, updated_at',
                seller_balance: 'user_id, updated_at',
                public_registrations: 'id, email, status, updated_at',
                sync_metadata: 'table_name, last_sync, status',
                settings: 'key',
            });
        },
        migrate: async () => {
            console.log('Migration v3 -> v4: manager spendings are now persisted for manager payments and admin insights');
        },
    },
];

/**
 * Get the current migration version
 * @param db Database instance
 * @returns Current schema version number
 */
export function getCurrentVersion(db: MFCBillDeskDB): number {
    return db.verno;
}

/**
 * Get the latest available migration version
 * @returns Latest migration version number
 */
export function getLatestVersion(): number {
    return migrations[migrations.length - 1]?.version || 0;
}

/**
 * Check if database needs migration
 * @param db Database instance
 * @returns True if migration is needed
 */
export function needsMigration(db: MFCBillDeskDB): boolean {
    return getCurrentVersion(db) < getLatestVersion();
}

/**
 * Apply all pending migrations
 * 
 * This function is called automatically by Dexie when the database is opened.
 * Migrations are applied sequentially from the current version to the latest.
 * 
 * @param db Database instance
 */
export function applyMigrations(db: MFCBillDeskDB): void {
    migrations.forEach(migration => {
        migration.up(db);
    });
}

/**
 * Run data migrations for a specific version
 * 
 * This should be called after schema migrations to transform existing data.
 * 
 * @param db Database instance
 * @param version Target version to migrate to
 */
export async function runDataMigration(
    db: MFCBillDeskDB,
    version: number
): Promise<void> {
    const migration = migrations.find(m => m.version === version);

    if (!migration) {
        throw new Error(`Migration version ${version} not found`);
    }

    if (migration.migrate) {
        console.log(`Running data migration for version ${version}...`);
        await migration.migrate(db);
        console.log(`Data migration for version ${version} completed`);
    }
}

/**
 * Get migration history
 * @returns Array of all migrations with their metadata
 */
export function getMigrationHistory(): Array<{
    version: number;
    description: string;
    hasDataMigration: boolean;
}> {
    return migrations.map(m => ({
        version: m.version,
        description: m.description,
        hasDataMigration: !!m.migrate,
    }));
}
