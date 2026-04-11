"use client";

import { db } from "@mfc/database";
import { getKolkataDateString } from "./kolkata-date";

const WEB_LOCAL_SCOPE_DAY_KEY = "mfc:web-local-scope-day";
const HISTORICAL_ONLY_TABLES = [
  "quotes",
  "quote_items",
  "customer_balance",
  "seller_balance",
] as const;

async function clearTable(tableName: string): Promise<void> {
  const table = (db as Record<string, any>)[tableName];
  if (!table) {
    return;
  }

  const keys = await table.toCollection().primaryKeys();
  if (keys.length > 0) {
    await table.bulkDelete(keys);
  }
}

async function pruneOperationalTables(today: string): Promise<void> {
  const [bills, chalans, customerPayments, sellerPayments] = await Promise.all([
    db.daily_bills.toArray(),
    db.chalans.toArray(),
    db.customer_payments.toArray(),
    db.seller_payments.toArray(),
  ]);

  const todayBillIds = new Set(
    bills.filter((bill) => bill.bill_date === today).map((bill) => bill.id)
  );
  const todayChalanIds = new Set(
    chalans.filter((chalan) => chalan.chalan_date === today).map((chalan) => chalan.id)
  );

  const staleBillIds = bills.filter((bill) => bill.bill_date !== today).map((bill) => bill.id);
  const staleChalanIds = chalans
    .filter((chalan) => chalan.chalan_date !== today)
    .map((chalan) => chalan.id);
  const staleCustomerPaymentIds = customerPayments
    .filter((payment) => payment.payment_date !== today)
    .map((payment) => payment.id);
  const staleSellerPaymentIds = sellerPayments
    .filter((payment) => payment.payment_date !== today)
    .map((payment) => payment.id);

  const saleTransactions = await db.sale_transactions.toArray();
  const staleSaleTransactionIds = saleTransactions
    .filter(
      (transaction) =>
        !todayBillIds.has(transaction.daily_bill_id) ||
        !todayChalanIds.has(transaction.chalan_id)
    )
    .map((transaction) => transaction.id);

  await Promise.all([
    staleBillIds.length ? db.daily_bills.bulkDelete(staleBillIds) : Promise.resolve(),
    staleChalanIds.length ? db.chalans.bulkDelete(staleChalanIds) : Promise.resolve(),
    staleCustomerPaymentIds.length
      ? db.customer_payments.bulkDelete(staleCustomerPaymentIds)
      : Promise.resolve(),
    staleSellerPaymentIds.length
      ? db.seller_payments.bulkDelete(staleSellerPaymentIds)
      : Promise.resolve(),
    staleSaleTransactionIds.length
      ? db.sale_transactions.bulkDelete(staleSaleTransactionIds)
      : Promise.resolve(),
  ]);
}

async function pruneInactiveStockBatches(): Promise<void> {
  const stockBatches = await db.stock_batches.toArray();
  const inactiveIds = stockBatches
    .filter((batch) => Number(batch.current_weight_kg) <= 0)
    .map((batch) => batch.id);

  if (inactiveIds.length > 0) {
    await db.stock_batches.bulkDelete(inactiveIds);
  }
}

export async function enforceWebLocalCacheScope(): Promise<{
  today: string;
  didRollOver: boolean;
}> {
  const today = getKolkataDateString();
  const previousDay =
    typeof window !== "undefined" ? window.localStorage.getItem(WEB_LOCAL_SCOPE_DAY_KEY) : null;

  await Promise.all([
    pruneOperationalTables(today),
    pruneInactiveStockBatches(),
    Promise.all(HISTORICAL_ONLY_TABLES.map((tableName) => clearTable(tableName))),
  ]);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(WEB_LOCAL_SCOPE_DAY_KEY, today);
  }

  return {
    today,
    didRollOver: previousDay !== null && previousDay !== today,
  };
}
