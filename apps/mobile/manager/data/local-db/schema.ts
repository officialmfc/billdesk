import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const mfcStaffTable = sqliteTable("mfc_staff", {
  id: text("id").primaryKey(),
  full_name: text("full_name").notNull(),
  role: text("role").notNull(),
  is_active: integer("is_active", { mode: "boolean" }).notNull(),
  is_default_admin: integer("is_default_admin", { mode: "boolean" }).notNull(),
  updated_at: text("updated_at").notNull(),
});

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  auth_user_id: text("auth_user_id"),
  name: text("name").notNull(),
  business_name: text("business_name"),
  phone: text("phone"),
  user_type: text("user_type").notNull(),
  default_role: text("default_role").notNull(),
  is_active: integer("is_active", { mode: "boolean" }).notNull(),
  address: text("address", { mode: "json" }),
  updated_at: text("updated_at").notNull(),
});

export const productsTable = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  is_stock_tracked: integer("is_stock_tracked", { mode: "boolean" }).notNull(),
  updated_at: text("updated_at").notNull(),
  created_by: text("created_by"),
  created_by_name: text("created_by_name"),
});

export const stockBatchesTable = sqliteTable("stock_batches", {
  id: text("id").primaryKey(),
  product_id: text("product_id").notNull(),
  batch_code: text("batch_code"),
  supplier_id: text("supplier_id"),
  mfc_seller_id: text("mfc_seller_id"),
  initial_weight_kg: real("initial_weight_kg").notNull(),
  current_weight_kg: real("current_weight_kg").notNull(),
  cost_per_kg: real("cost_per_kg"),
  updated_at: text("updated_at").notNull(),
  created_by: text("created_by"),
  product_name: text("product_name"),
  supplier_name: text("supplier_name"),
  created_by_name: text("created_by_name"),
});

export const dailyBillsTable = sqliteTable("daily_bills", {
  id: text("id").primaryKey(),
  bill_number: text("bill_number").notNull(),
  customer_id: text("customer_id").notNull(),
  bill_date: text("bill_date").notNull(),
  total_amount: real("total_amount").notNull(),
  amount_paid: real("amount_paid").notNull(),
  status: text("status").notNull(),
  is_migration_bill: integer("is_migration_bill", { mode: "boolean" }).notNull(),
  updated_at: text("updated_at").notNull(),
  created_by: text("created_by"),
  buyer_name: text("buyer_name"),
  created_by_name: text("created_by_name"),
});

export const chalansTable = sqliteTable("chalans", {
  id: text("id").primaryKey(),
  chalan_number: text("chalan_number").notNull(),
  seller_id: text("seller_id"),
  mfc_seller_id: text("mfc_seller_id"),
  chalan_date: text("chalan_date").notNull(),
  total_sale_value: real("total_sale_value").notNull(),
  commission_rate_percent: real("commission_rate_percent").notNull(),
  commission_amount: real("commission_amount").notNull(),
  net_payable: real("net_payable").notNull(),
  amount_paid: real("amount_paid").notNull(),
  status: text("status").notNull(),
  updated_at: text("updated_at").notNull(),
  created_by: text("created_by"),
  seller_name: text("seller_name"),
  created_by_name: text("created_by_name"),
});

export const saleTransactionsTable = sqliteTable("sale_transactions", {
  id: text("id").primaryKey(),
  daily_bill_id: text("daily_bill_id").notNull(),
  chalan_id: text("chalan_id").notNull(),
  stock_batch_id: text("stock_batch_id"),
  product_id: text("product_id"),
  product_description: text("product_description"),
  weight_kg: real("weight_kg").notNull(),
  price_per_kg: real("price_per_kg").notNull(),
  amount: real("amount").notNull(),
  sale_type: text("sale_type").notNull(),
  updated_at: text("updated_at").notNull(),
  created_by: text("created_by"),
  product_name: text("product_name"),
  bill_number: text("bill_number"),
  created_by_name: text("created_by_name"),
});

export const customerPaymentsTable = sqliteTable("customer_payments", {
  id: text("id").primaryKey(),
  daily_bill_id: text("daily_bill_id").notNull(),
  payment_date: text("payment_date").notNull(),
  amount: real("amount").notNull(),
  payment_method: text("payment_method").notNull(),
  updated_at: text("updated_at").notNull(),
  created_by: text("created_by"),
  created_by_name: text("created_by_name"),
});

export const sellerPaymentsTable = sqliteTable("seller_payments", {
  id: text("id").primaryKey(),
  chalan_id: text("chalan_id").notNull(),
  payment_date: text("payment_date").notNull(),
  amount: real("amount").notNull(),
  payment_method: text("payment_method").notNull(),
  updated_at: text("updated_at").notNull(),
  created_by: text("created_by"),
  created_by_name: text("created_by_name"),
});

export const managerSpendingsTable = sqliteTable("manager_spendings", {
  id: text("id").primaryKey(),
  spent_date: text("spent_date").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  note: text("note"),
  payment_method: text("payment_method").notNull(),
  updated_at: text("updated_at").notNull(),
  created_by: text("created_by"),
  created_by_name: text("created_by_name"),
});

export const quotesTable = sqliteTable("quotes", {
  id: text("id").primaryKey(),
  quote_number: text("quote_number").notNull(),
  customer_id: text("customer_id").notNull(),
  assigned_mfc_seller_id: text("assigned_mfc_seller_id"),
  delivery_date: text("delivery_date").notNull(),
  total_amount: real("total_amount").notNull(),
  advance_paid: real("advance_paid").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  updated_at: text("updated_at").notNull(),
  created_by: text("created_by"),
  buyer_name: text("buyer_name"),
  created_by_name: text("created_by_name"),
});

export const quoteItemsTable = sqliteTable("quote_items", {
  id: text("id").primaryKey(),
  quote_id: text("quote_id").notNull(),
  product_id: text("product_id"),
  product_description: text("product_description"),
  weight_kg: real("weight_kg").notNull(),
  price_per_kg: real("price_per_kg").notNull(),
  line_total: real("line_total").notNull(),
  product_name: text("product_name"),
});

export const customerBalanceTable = sqliteTable("customer_balance", {
  user_id: text("user_id").primaryKey(),
  total_billed: real("total_billed").notNull(),
  total_paid: real("total_paid").notNull(),
  current_due: real("current_due").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const sellerBalanceTable = sqliteTable("seller_balance", {
  user_id: text("user_id").primaryKey(),
  total_earned: real("total_earned").notNull(),
  total_paid_out: real("total_paid_out").notNull(),
  current_due: real("current_due").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const syncMetadataTable = sqliteTable("sync_metadata", {
  table_name: text("table_name").primaryKey(),
  last_sync: text("last_sync").notNull(),
  status: text("status").notNull(),
  error_message: text("error_message"),
});

export const settingsTable = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }),
});

export const localDbSchema = {
  mfcStaffTable,
  usersTable,
  productsTable,
  stockBatchesTable,
  dailyBillsTable,
  chalansTable,
  saleTransactionsTable,
  customerPaymentsTable,
  sellerPaymentsTable,
  managerSpendingsTable,
  quotesTable,
  quoteItemsTable,
  customerBalanceTable,
  sellerBalanceTable,
  syncMetadataTable,
  settingsTable,
};

export const drizzleTables = {
  mfc_staff: mfcStaffTable,
  users: usersTable,
  products: productsTable,
  stock_batches: stockBatchesTable,
  daily_bills: dailyBillsTable,
  chalans: chalansTable,
  sale_transactions: saleTransactionsTable,
  customer_payments: customerPaymentsTable,
  seller_payments: sellerPaymentsTable,
  manager_spendings: managerSpendingsTable,
  quotes: quotesTable,
  quote_items: quoteItemsTable,
  customer_balance: customerBalanceTable,
  seller_balance: sellerBalanceTable,
  sync_metadata: syncMetadataTable,
  settings: settingsTable,
} as const;
