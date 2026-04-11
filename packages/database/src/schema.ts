/**
 * MFC BillDesk IndexedDB Schema
 * 
 * This file defines the IndexedDB schema using Dexie.js for offline-first data storage.
 * The schema mirrors the Supabase PostgreSQL schema for seamless synchronization.
 * 
 * @package @mfc/database
 * @version 2.0.0
 */
import Dexie, { type Table } from 'dexie';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
// These interfaces define the structure of data stored in IndexedDB.
// They are optimized for offline access with cached denormalized fields
// (e.g., names) to reduce joins and improve query performance.

/**
 * User entity - Represents customers (buyers/sellers) in the system
 * 
 * Indexes:
 * - id: Primary key
 * - auth_user_id: For auth lookup
 * - name: For search and autocomplete
 * - phone: For contact lookup
 * - user_type: For filtering by type
 * - default_role: For role-based queries
 * - updated_at: For sync operations
 */
export interface LocalUser {
    id: string;
    auth_user_id: string | null;
    name: string;
    business_name: string | null;
    phone: string | null;
    user_type: 'vendor' | 'business';
    default_role: 'buyer' | 'seller';
    is_active: boolean;
    address: any | null;
    updated_at: string;
    // Exclude: profile_photo_url, created_by, updated_by, created_at
}

/**
 * MFC Staff entity - Internal staff members (admin, manager, sellers)
 * 
 * Indexes:
 * - id: Primary key
 * - full_name: For search and display
 * - role: For role-based filtering
 * - is_active: For active staff queries
 * - updated_at: For sync operations
 */
export interface LocalMfcStaff {
    id: string;
    full_name: string;
    role: 'admin' | 'manager' | 'mfc_seller';
    is_active: boolean;
    is_default_admin: boolean;
    updated_at: string;
    // Exclude: created_by, updated_by, created_at
}

/**
 * Product entity - Fish products available for sale
 * 
 * Indexes:
 * - id: Primary key
 * - name: For search and autocomplete
 * - is_stock_tracked: For inventory queries
 * - updated_at: For sync operations
 */
export interface LocalProduct {
    id: string;
    name: string;
    description: string | null;
    is_stock_tracked: boolean;
    updated_at: string;
    created_by?: string;
    // Cached
    created_by_name?: string;
    // Exclude: updated_by, created_at
}

/**
 * Stock Batch entity - Inventory batches of products
 * 
 * Indexes:
 * - id: Primary key
 * - product_id: For product-based queries
 * - batch_code: For batch lookup
 * - supplier_id: For supplier queries
 * - mfc_seller_id: For seller assignment
 * - updated_at: For sync operations
 */
export interface LocalStockBatch {
    id: string;
    product_id: string;
    batch_code: string | null;
    supplier_id: string | null;
    mfc_seller_id: string | null;
    initial_weight_kg: number;
    current_weight_kg: number;
    cost_per_kg: number | null;
    updated_at: string;
    created_by?: string;
    // Cached
    product_name?: string;
    supplier_name?: string;
    created_by_name?: string;
    // Exclude: updated_by, created_at
}

/**
 * Daily Bill entity - Customer bills/invoices
 * 
 * Indexes:
 * - id: Primary key
 * - bill_number: For bill lookup
 * - customer_id: For customer queries
 * - [customer_id+bill_date]: Compound index for customer history
 * - bill_date: For date-based queries
 * - status: For filtering by payment status
 * - updated_at: For sync operations
 */
export interface LocalDailyBill {
    id: string;
    bill_number: string;
    customer_id: string;
    bill_date: string; // date as string
    total_amount: number;
    amount_paid: number;
    status: 'due' | 'partially_paid' | 'paid';
    is_migration_bill: boolean;
    updated_at: string;
    created_by?: string;
    // Cached
    buyer_name?: string;
    created_by_name?: string;
    // Exclude: updated_by, created_at
}

/**
 * Sale Transaction entity - Individual line items in sales
 * 
 * Indexes:
 * - id: Primary key
 * - daily_bill_id: For bill line items
 * - chalan_id: For chalan line items
 * - product_id: For product sales queries
 * - stock_batch_id: For inventory tracking
 * - sale_type: For filtering by sale type
 * - updated_at: For sync operations
 */
export interface LocalSaleTransaction {
    id: string;
    daily_bill_id: string;
    chalan_id: string;
    stock_batch_id: string | null;
    product_id: string | null;
    product_description: string | null;
    weight_kg: number;
    price_per_kg: number;
    amount: number;
    sale_type: 'auction' | 'direct_sell';
    updated_at: string;
    created_by?: string;
    // Cached
    product_name?: string;
    bill_number?: string;
    created_by_name?: string;
    // Exclude: updated_by, created_at
}

/**
 * Chalan entity - Seller commission documents
 * 
 * Indexes:
 * - id: Primary key
 * - chalan_number: For chalan lookup
 * - seller_id: For seller queries
 * - mfc_seller_id: For MFC seller assignment
 * - [seller_id+chalan_date]: Compound index for seller history
 * - chalan_date: For date-based queries
 * - status: For filtering by payment status
 * - updated_at: For sync operations
 */
export interface LocalChalan {
    id: string;
    chalan_number: string;
    seller_id: string | null;
    mfc_seller_id: string | null;
    chalan_date: string; // date as string
    total_sale_value: number;
    commission_rate_percent: number;
    commission_amount: number;
    net_payable: number;
    amount_paid: number;
    status: 'due' | 'partially_paid' | 'paid';
    updated_at: string;
    created_by?: string;
    // Cached
    seller_name?: string;
    created_by_name?: string;
    // Exclude: updated_by, created_at
}

/**
 * Quote entity - Customer quotations/orders
 * 
 * Indexes:
 * - id: Primary key
 * - quote_number: For quote lookup
 * - customer_id: For customer queries
 * - [customer_id+delivery_date]: Compound index for customer orders
 * - delivery_date: For delivery scheduling
 * - status: For filtering by quote status
 * - updated_at: For sync operations
 */
export interface LocalQuote {
    id: string;
    quote_number: string;
    customer_id: string;
    assigned_mfc_seller_id: string | null;
    delivery_date: string; // date as string
    total_amount: number;
    advance_paid: number;
    status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
    notes: string | null;
    updated_at: string;
    created_by?: string;
    // Cached
    buyer_name?: string;
    created_by_name?: string;
    // Exclude: updated_by, created_at
}

/**
 * Quote Item entity - Line items in quotations
 * 
 * Indexes:
 * - id: Primary key
 * - quote_id: For quote line items
 * - product_id: For product queries
 */
export interface LocalQuoteItem {
    id: string;
    quote_id: string;
    product_id: string | null;
    product_description: string | null;
    weight_kg: number;
    price_per_kg: number;
    line_total: number;
    // Cached
    product_name?: string;
}

/**
 * Customer Payment entity - Payments received from customers
 * 
 * Indexes:
 * - id: Primary key
 * - daily_bill_id: For bill payments
 * - [daily_bill_id+payment_date]: Compound index for payment history
 * - payment_date: For date-based queries
 * - updated_at: For sync operations
 */
export interface LocalCustomerPayment {
    id: string;
    daily_bill_id: string;
    payment_date: string; // date as string
    amount: number;
    payment_method: string;
    updated_at: string;
    created_by?: string;
    // Cached
    created_by_name?: string;
    // Exclude: updated_by, created_at
}

/**
 * Seller Payment entity - Payments made to sellers
 * 
 * Indexes:
 * - id: Primary key
 * - chalan_id: For chalan payments
 * - [chalan_id+payment_date]: Compound index for payment history
 * - payment_date: For date-based queries
 * - updated_at: For sync operations
 */
export interface LocalSellerPayment {
    id: string;
    chalan_id: string;
    payment_date: string; // date as string
    amount: number;
    payment_method: string;
    updated_at: string;
    created_by?: string;
    // Cached
    created_by_name?: string;
    // Exclude: updated_by, created_at
}

/**
 * Manager Spending entity - Operational spend logged by staff
 *
 * Indexes:
 * - id: Primary key
 * - spent_date: For date-based queries
 * - [created_by+spent_date]: Compound index for manager-wise breakdowns
 * - category: For filtering by category
 * - updated_at: For sync operations
 */
export interface LocalManagerSpending {
    id: string;
    spent_date: string;
    title: string;
    category: string;
    amount: number;
    note: string | null;
    payment_method: string;
    updated_at: string;
    created_by?: string | null;
    created_by_name?: string;
}

/**
 * Customer Balance entity - Aggregated customer account balances
 * 
 * Indexes:
 * - user_id: Primary key
 * - updated_at: For sync operations
 */
export interface LocalCustomerBalance {
    user_id: string;
    total_billed: number;
    total_paid: number;
    current_due: number;
    updated_at: string;
}

/**
 * Seller Balance entity - Aggregated seller account balances
 * 
 * Indexes:
 * - user_id: Primary key
 * - updated_at: For sync operations
 */
export interface LocalSellerBalance {
    user_id: string;
    total_earned: number;
    total_paid_out: number;
    current_due: number;
    updated_at: string;
}

/**
 * Public Registration entity - User registration requests
 * 
 * Indexes:
 * - id: Primary key
 * - email: For email lookup
 * - status: For filtering by approval status
 * - updated_at: For sync operations
 */
export interface LocalPublicRegistration {
    id: string;
    auth_user_id: string | null;
    email: string;
    full_name: string | null;
    business_name: string | null;
    phone: string | null;
    message: string | null;
    registration_kind: 'self_signup' | 'user_invite' | 'manager_invite';
    approval_target: 'user' | 'staff';
    requested_app: string | null;
    requested_platform: string | null;
    requested_user_type: 'vendor' | 'business' | null;
    requested_default_role: 'buyer' | 'seller' | null;
    requested_staff_role: 'admin' | 'manager' | 'mfc_seller' | null;
    invite_token: string | null;
    invite_expires_at: string | null;
    invited_by: string | null;
    status: 'pending' | 'approved' | 'rejected';
    updated_at: string;
    approved_record_id?: string | null;
    approved_at?: string | null;
    rejected_at?: string | null;
    rejection_reason?: string | null;
    // Exclude: updated_by, created_at
}

// ============================================================================
// METADATA TYPES
// ============================================================================
// These types support internal database operations like sync tracking
// and application settings storage.

/**
 * Sync Metadata entity - Tracks synchronization state per table
 * 
 * Indexes:
 * - table_name: Primary key
 * - last_sync: For sync time tracking
 * - status: For sync status queries
 */
export interface SyncMetadata {
    table_name: string;
    last_sync: string;
    status: 'idle' | 'syncing' | 'error';
    error_message?: string;
}

/**
 * App Settings entity - Key-value store for application settings
 * 
 * Indexes:
 * - key: Primary key
 */
export interface AppSettings {
    key: string;
    value: any;
}

// ============================================================================
// DATABASE CLASS
// ============================================================================

/**
 * MFC BillDesk IndexedDB Database
 * 
 * This class defines the IndexedDB schema using Dexie.js. It provides
 * typed table access and manages schema versioning through migrations.
 * 
 * Schema Version: 4
 * 
 * Performance Considerations:
 * - Compound indexes are used for common query patterns (e.g., customer_id+date)
 * - Denormalized fields (cached names) reduce the need for joins
 * - All tables include updated_at for efficient sync operations
 * 
 * @extends Dexie
 */
export class MFCBillDeskDB extends Dexie {
    // Main tables - Based on database/schemas.sql
    users!: Table<LocalUser, string>;
    mfc_staff!: Table<LocalMfcStaff, string>;
    products!: Table<LocalProduct, string>;
    stock_batches!: Table<LocalStockBatch, string>;
    daily_bills!: Table<LocalDailyBill, string>;
    sale_transactions!: Table<LocalSaleTransaction, string>;
    chalans!: Table<LocalChalan, string>;
    quotes!: Table<LocalQuote, string>;
    quote_items!: Table<LocalQuoteItem, string>;
    customer_payments!: Table<LocalCustomerPayment, string>;
    seller_payments!: Table<LocalSellerPayment, string>;
    manager_spendings!: Table<LocalManagerSpending, string>;
    customer_balance!: Table<LocalCustomerBalance, string>;
    seller_balance!: Table<LocalSellerBalance, string>;
    public_registrations!: Table<LocalPublicRegistration, string>;

    // Metadata tables
    sync_metadata!: Table<SyncMetadata, string>;
    settings!: Table<AppSettings, string>;

    constructor(dbName: string = 'mfc_billdesk_local') {
        super(dbName);

        // Schema version 2 - Existing production IndexedDB schema
        this.version(2).stores({
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

        // Schema version 3 - Restore created_by for manager-owned records
        this.version(3).stores({
            // User Management Tables
            users: 'id, auth_user_id, name, business_name, phone, user_type, default_role, is_active, updated_at',
            mfc_staff: 'id, full_name, role, is_active, updated_at',

            // Product & Inventory Tables
            products: 'id, name, is_stock_tracked, created_by, updated_at',
            stock_batches: 'id, product_id, batch_code, supplier_id, mfc_seller_id, created_by, updated_at',

            // Sales & Billing Tables
            daily_bills: 'id, bill_number, customer_id, [customer_id+bill_date], [created_by+bill_date], bill_date, created_by, status, updated_at',
            sale_transactions: 'id, daily_bill_id, chalan_id, product_id, stock_batch_id, sale_type, created_by, updated_at',
            chalans: 'id, chalan_number, seller_id, mfc_seller_id, [seller_id+chalan_date], [created_by+chalan_date], chalan_date, created_by, status, updated_at',

            // Quotation Tables
            quotes: 'id, quote_number, customer_id, [customer_id+delivery_date], [created_by+delivery_date], delivery_date, created_by, status, updated_at',
            quote_items: 'id, quote_id, product_id',

            // Payment Tables
            customer_payments: 'id, daily_bill_id, [daily_bill_id+payment_date], [created_by+payment_date], payment_date, created_by, updated_at',
            seller_payments: 'id, chalan_id, [chalan_id+payment_date], [created_by+payment_date], payment_date, created_by, updated_at',

            // Balance Tables (Aggregated Views)
            customer_balance: 'user_id, updated_at',
            seller_balance: 'user_id, updated_at',

            // Registration Table
            public_registrations: 'id, email, status, updated_at',

            // Metadata Tables
            sync_metadata: 'table_name, last_sync, status',
            settings: 'key',
        });

        // Schema version 4 - Add manager spendings to the local read model
        this.version(4).stores({
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
    }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default MFCBillDeskDB;
