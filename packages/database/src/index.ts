/**
 * @mfc/database - IndexedDB Schema and Types
 * 
 * This package provides the IndexedDB schema definition and type definitions
 * for the MFC BillDesk application. It is intentionally minimal and focused
 * on schema management only.
 * 
 * Business logic, data access patterns, and sync operations should be
 * implemented in the @mfc/data-access package.
 * 
 * @package @mfc/database
 * @version 2.0.0
 */

// ============================================================================
// DATABASE INSTANCE
// ============================================================================

export { db } from './instance';

// ============================================================================
// SCHEMA AND DATABASE CLASS
// ============================================================================

export { MFCBillDeskDB } from './schema';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Entity Types
export type {
    LocalUser,
    LocalMfcStaff,
    LocalProduct,
    LocalStockBatch,
    LocalDailyBill,
    LocalSaleTransaction,
    LocalChalan,
    LocalQuote,
    LocalQuoteItem,
    LocalCustomerPayment,
    LocalSellerPayment,
    LocalManagerSpending,
    LocalCustomerBalance,
    LocalSellerBalance,
    LocalPublicRegistration,
    SyncMetadata,
    AppSettings,
} from './schema';

// Sales Types
export type {
    AuctionSell,
    DirectSell,
    SaleItemInput,
    CreateAuctionChalanParams,
    CreateAuctionChalanResult,
    CreateDirectSaleParams,
    CreateDirectSaleResult,
    SaleSummary,
    BuyerPurchaseSummary,
} from './types/sales';

// ============================================================================
// MIGRATIONS
// ============================================================================

export {
    migrations,
    applyMigrations,
    getCurrentVersion,
    getLatestVersion,
    needsMigration,
    runDataMigration,
    getMigrationHistory,
    type Migration,
} from './migrations';
