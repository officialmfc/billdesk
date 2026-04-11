"use client";

import type {
  LocalChalan,
  LocalCustomerBalance,
  LocalCustomerPayment,
  LocalDailyBill,
  LocalMfcStaff,
  LocalManagerSpending,
  LocalProduct,
  LocalQuote,
  LocalSaleTransaction,
  LocalSellerBalance,
  LocalSellerPayment,
  LocalStockBatch,
  LocalUser,
} from "@mfc/database";
import { MANAGER_READ_MODEL_SELECT_COLUMNS } from "@mfc/manager-sync-model";
import type { SupabaseClient } from "@supabase/supabase-js";

import { cacheMfcStaffInDexie, cacheUsersInDexie } from "@/lib/web-dexie-cache";

const WEB_REMOTE_COLUMNS = {
  users: [...MANAGER_READ_MODEL_SELECT_COLUMNS.users],
  mfc_staff: [...MANAGER_READ_MODEL_SELECT_COLUMNS.mfc_staff],
  products: [...MANAGER_READ_MODEL_SELECT_COLUMNS.products],
  stock_batches: [...MANAGER_READ_MODEL_SELECT_COLUMNS.stock_batches],
  daily_bills: [...MANAGER_READ_MODEL_SELECT_COLUMNS.daily_bills],
  sale_transactions: [...MANAGER_READ_MODEL_SELECT_COLUMNS.sale_transactions],
  chalans: [...MANAGER_READ_MODEL_SELECT_COLUMNS.chalans],
  customer_payments: [
    ...MANAGER_READ_MODEL_SELECT_COLUMNS.customer_payments,
  ],
  seller_payments: [
    ...MANAGER_READ_MODEL_SELECT_COLUMNS.seller_payments,
  ],
  manager_spendings: [
    ...MANAGER_READ_MODEL_SELECT_COLUMNS.manager_spendings,
  ],
  customer_balance: [...MANAGER_READ_MODEL_SELECT_COLUMNS.customer_balance],
  seller_balance: [...MANAGER_READ_MODEL_SELECT_COLUMNS.seller_balance],
  quotes: [
    ...MANAGER_READ_MODEL_SELECT_COLUMNS.quotes.filter((column) => column !== "updated_at"),
    "created_at",
  ],
} as const;

export interface WebQuoteRecord extends LocalQuote {
  created_at: string;
}

export interface WebPaymentsReadModel {
  users: LocalUser[];
  mfcStaff: LocalMfcStaff[];
  customerBalances: LocalCustomerBalance[];
  sellerBalances: LocalSellerBalance[];
  bills: LocalDailyBill[];
  chalans: LocalChalan[];
  customerPayments: LocalCustomerPayment[];
  sellerPayments: LocalSellerPayment[];
  managerSpendings: LocalManagerSpending[];
}

export interface WebLedgersReadModel extends WebPaymentsReadModel {
  saleTransactions: LocalSaleTransaction[];
}

export interface WebQuotesReadModel {
  users: LocalUser[];
  mfcStaff: LocalMfcStaff[];
  quotes: WebQuoteRecord[];
}

export interface WebOperationsReadModel {
  users: LocalUser[];
  mfcStaff: LocalMfcStaff[];
  bills: LocalDailyBill[];
  chalans: LocalChalan[];
  customerPayments: LocalCustomerPayment[];
  sellerPayments: LocalSellerPayment[];
  saleTransactions: LocalSaleTransaction[];
}

async function selectRows<T>(
  supabase: SupabaseClient,
  table: string,
  columns: readonly string[],
  apply?: (query: any) => any
): Promise<T[]> {
  let query = supabase.from(table).select(columns.join(", "));

  if (apply) {
    query = apply(query);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as T[];
}

function dedupeById<T extends { id: string }>(rows: T[]): T[] {
  const map = new Map<string, T>();

  for (const row of rows) {
    map.set(row.id, row);
  }

  return Array.from(map.values());
}

export async function loadWebPaymentsReadModel(
  supabase: SupabaseClient
): Promise<WebPaymentsReadModel> {
  const [
    users,
    mfcStaff,
    customerBalances,
    sellerBalances,
    bills,
    chalans,
    customerPayments,
    sellerPayments,
    managerSpendings,
  ] = await Promise.all([
    selectRows<LocalUser>(supabase, "users", WEB_REMOTE_COLUMNS.users),
    selectRows<LocalMfcStaff>(supabase, "mfc_staff", WEB_REMOTE_COLUMNS.mfc_staff),
    selectRows<LocalCustomerBalance>(
      supabase,
      "customer_balance",
      WEB_REMOTE_COLUMNS.customer_balance
    ),
    selectRows<LocalSellerBalance>(
      supabase,
      "seller_balance",
      WEB_REMOTE_COLUMNS.seller_balance
    ),
    selectRows<LocalDailyBill>(supabase, "daily_bills", WEB_REMOTE_COLUMNS.daily_bills),
    selectRows<LocalChalan>(supabase, "chalans", WEB_REMOTE_COLUMNS.chalans),
    selectRows<LocalCustomerPayment>(
      supabase,
      "customer_payments",
      WEB_REMOTE_COLUMNS.customer_payments
    ),
    selectRows<LocalSellerPayment>(
      supabase,
      "seller_payments",
      WEB_REMOTE_COLUMNS.seller_payments
    ),
    selectRows<LocalManagerSpending>(
      supabase,
      "manager_spendings",
      WEB_REMOTE_COLUMNS.manager_spendings
    ),
  ]);

  await Promise.all([cacheUsersInDexie(users), cacheMfcStaffInDexie(mfcStaff)]);

  return {
    users,
    mfcStaff,
    customerBalances,
    sellerBalances,
    bills,
    chalans,
    customerPayments,
    sellerPayments,
    managerSpendings,
  };
}

export async function loadWebLedgersReadModel(
  supabase: SupabaseClient
): Promise<WebLedgersReadModel> {
  const [paymentsModel, saleTransactions] = await Promise.all([
    loadWebPaymentsReadModel(supabase),
    selectRows<LocalSaleTransaction>(
      supabase,
      "sale_transactions",
      WEB_REMOTE_COLUMNS.sale_transactions
    ),
  ]);

  return {
    ...paymentsModel,
    saleTransactions,
  };
}

export async function loadWebQuotesReadModel(
  supabase: SupabaseClient
): Promise<WebQuotesReadModel> {
  const [users, mfcStaff, quotes] = await Promise.all([
    selectRows<LocalUser>(supabase, "users", WEB_REMOTE_COLUMNS.users),
    selectRows<LocalMfcStaff>(supabase, "mfc_staff", WEB_REMOTE_COLUMNS.mfc_staff),
    selectRows<WebQuoteRecord>(supabase, "quotes", WEB_REMOTE_COLUMNS.quotes, (query) =>
      query.order("created_at", { ascending: false })
    ),
  ]);

  await Promise.all([cacheUsersInDexie(users), cacheMfcStaffInDexie(mfcStaff)]);

  return {
    users,
    mfcStaff,
    quotes,
  };
}

export async function loadWebOperationsReadModel(
  supabase: SupabaseClient,
  dateStr: string
): Promise<WebOperationsReadModel> {
  const [users, mfcStaff, bills, customerPayments, chalans, sellerPayments] = await Promise.all([
    selectRows<LocalUser>(supabase, "users", WEB_REMOTE_COLUMNS.users),
    selectRows<LocalMfcStaff>(supabase, "mfc_staff", WEB_REMOTE_COLUMNS.mfc_staff),
    selectRows<LocalDailyBill>(supabase, "daily_bills", WEB_REMOTE_COLUMNS.daily_bills, (query) =>
      query.lte("bill_date", dateStr).order("bill_date", { ascending: false })
    ),
    selectRows<LocalCustomerPayment>(
      supabase,
      "customer_payments",
      WEB_REMOTE_COLUMNS.customer_payments,
      (query) => query.lte("payment_date", dateStr).order("payment_date", { ascending: false })
    ),
    selectRows<LocalChalan>(supabase, "chalans", WEB_REMOTE_COLUMNS.chalans, (query) =>
      query.eq("chalan_date", dateStr).order("chalan_number", { ascending: true })
    ),
    selectRows<LocalSellerPayment>(
      supabase,
      "seller_payments",
      WEB_REMOTE_COLUMNS.seller_payments,
      (query) => query.eq("payment_date", dateStr).order("payment_date", { ascending: false })
    ),
  ]);

  await Promise.all([cacheUsersInDexie(users), cacheMfcStaffInDexie(mfcStaff)]);

  const dayBillIds = bills.filter((bill) => bill.bill_date === dateStr).map((bill) => bill.id);
  const dayChalanIds = chalans.map((chalan) => chalan.id);

  const [billTransactions, chalanTransactions] = await Promise.all([
    dayBillIds.length > 0
      ? selectRows<LocalSaleTransaction>(
          supabase,
          "sale_transactions",
          WEB_REMOTE_COLUMNS.sale_transactions,
          (query) => query.in("daily_bill_id", dayBillIds)
        )
      : Promise.resolve([]),
    dayChalanIds.length > 0
      ? selectRows<LocalSaleTransaction>(
          supabase,
          "sale_transactions",
          WEB_REMOTE_COLUMNS.sale_transactions,
          (query) => query.in("chalan_id", dayChalanIds)
        )
      : Promise.resolve([]),
  ]);

  return {
    users,
    mfcStaff,
    bills,
    customerPayments,
    chalans,
    sellerPayments,
    saleTransactions: dedupeById([...billTransactions, ...chalanTransactions]),
  };
}
