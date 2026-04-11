import type { InferSelectModel } from "drizzle-orm";
import { MANAGER_READ_MODEL_TABLES } from "@mfc/manager-sync-model";

import {
  chalansTable,
  customerBalanceTable,
  customerPaymentsTable,
  dailyBillsTable,
  mfcStaffTable,
  productsTable,
  quoteItemsTable,
  quotesTable,
  managerSpendingsTable,
  saleTransactionsTable,
  sellerBalanceTable,
  sellerPaymentsTable,
  settingsTable,
  stockBatchesTable,
  syncMetadataTable,
  usersTable,
} from "./schema";

export type MobileUser = InferSelectModel<typeof usersTable>;
export type MobileMfcStaff = InferSelectModel<typeof mfcStaffTable>;
export type MobileProduct = InferSelectModel<typeof productsTable>;
export type MobileStockBatch = InferSelectModel<typeof stockBatchesTable>;
export type MobileDailyBill = InferSelectModel<typeof dailyBillsTable>;
export type MobileSaleTransaction = InferSelectModel<typeof saleTransactionsTable>;
export type MobileChalan = InferSelectModel<typeof chalansTable>;
export type MobileQuote = InferSelectModel<typeof quotesTable>;
export type MobileQuoteItem = InferSelectModel<typeof quoteItemsTable>;
export type MobileCustomerPayment = InferSelectModel<typeof customerPaymentsTable>;
export type MobileSellerPayment = InferSelectModel<typeof sellerPaymentsTable>;
export type MobileManagerSpending = InferSelectModel<typeof managerSpendingsTable>;
export type MobileCustomerBalance = InferSelectModel<typeof customerBalanceTable>;
export type MobileSellerBalance = InferSelectModel<typeof sellerBalanceTable>;
export type MobileSyncMetadata = InferSelectModel<typeof syncMetadataTable>;
export type MobileAppSetting = InferSelectModel<typeof settingsTable>;

export const BUSINESS_TABLES = MANAGER_READ_MODEL_TABLES.filter(
  (table) => table !== "system_config"
) as Exclude<(typeof MANAGER_READ_MODEL_TABLES)[number], "system_config">[];

export const ALL_LOCAL_TABLES = [
  ...BUSINESS_TABLES,
  "sync_metadata",
  "settings",
] as const;

export type BusinessTableName = (typeof BUSINESS_TABLES)[number];
export type SyncTableName = (typeof ALL_LOCAL_TABLES)[number];

export type TableRecordMap = {
  mfc_staff: MobileMfcStaff;
  users: MobileUser;
  products: MobileProduct;
  stock_batches: MobileStockBatch;
  daily_bills: MobileDailyBill;
  chalans: MobileChalan;
  sale_transactions: MobileSaleTransaction;
  customer_payments: MobileCustomerPayment;
  seller_payments: MobileSellerPayment;
  manager_spendings: MobileManagerSpending;
  quotes: MobileQuote;
  quote_items: MobileQuoteItem;
  customer_balance: MobileCustomerBalance;
  seller_balance: MobileSellerBalance;
  sync_metadata: MobileSyncMetadata;
  settings: MobileAppSetting;
};

export const PRIMARY_KEY_BY_TABLE: Record<SyncTableName, string> = {
  mfc_staff: "id",
  users: "id",
  products: "id",
  stock_batches: "id",
  daily_bills: "id",
  chalans: "id",
  sale_transactions: "id",
  customer_payments: "id",
  seller_payments: "id",
  manager_spendings: "id",
  quotes: "id",
  quote_items: "id",
  customer_balance: "user_id",
  seller_balance: "user_id",
  sync_metadata: "table_name",
  settings: "key",
};
