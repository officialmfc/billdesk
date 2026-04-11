import type {
  MobileChalan,
  MobileCustomerBalance,
  MobileCustomerPayment,
  MobileDailyBill,
  MobileMfcStaff,
  MobileManagerSpending,
  MobileProduct,
  MobileQuote,
  MobileQuoteItem,
  MobileSaleTransaction,
  MobileSellerBalance,
  MobileSellerPayment,
  MobileStockBatch,
  MobileSyncMetadata,
  MobileUser,
} from "@/data/local-db";
import { syncEngine } from "@/lib/sync-engine";

type Snapshot = {
  users: MobileUser[];
  mfcStaff: MobileMfcStaff[];
  products: MobileProduct[];
  stockBatches: MobileStockBatch[];
  dailyBills: MobileDailyBill[];
  chalans: MobileChalan[];
  saleTransactions: MobileSaleTransaction[];
  customerPayments: MobileCustomerPayment[];
  sellerPayments: MobileSellerPayment[];
  managerSpendings: MobileManagerSpending[];
  quotes: MobileQuote[];
  quoteItems: MobileQuoteItem[];
  customerBalances: MobileCustomerBalance[];
  sellerBalances: MobileSellerBalance[];
  syncMetadata: MobileSyncMetadata[];
};

type RawMfcStaff = Omit<MobileMfcStaff, "is_active" | "is_default_admin"> & {
  is_active: number | boolean;
  is_default_admin: number | boolean;
};

type RawUser = Omit<MobileUser, "is_active" | "address"> & {
  is_active: number | boolean;
  address: string | null;
};

type RawProduct = Omit<MobileProduct, "is_stock_tracked"> & {
  is_stock_tracked: number | boolean;
};

type RawDailyBill = Omit<MobileDailyBill, "is_migration_bill" | "buyer_name" | "created_by_name"> & {
  is_migration_bill: number | boolean;
};

type RawChalan = Omit<MobileChalan, "seller_name" | "created_by_name">;
type RawSaleTransaction = Omit<MobileSaleTransaction, "product_name" | "bill_number" | "created_by_name">;
type RawCustomerPayment = Omit<MobileCustomerPayment, "created_by_name">;
type RawSellerPayment = Omit<MobileSellerPayment, "created_by_name">;
type RawManagerSpending = Omit<MobileManagerSpending, "created_by_name">;
type RawQuote = Omit<MobileQuote, "buyer_name" | "created_by_name">;
type RawQuoteItem = Omit<MobileQuoteItem, "product_name">;
type RawStockBatch = Omit<MobileStockBatch, "product_name" | "supplier_name" | "created_by_name">;

function toBoolean(value: number | boolean | null | undefined) {
  return value === true || value === 1;
}

function parseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function userDisplayName(user?: { name: string; business_name: string | null } | null) {
  return user?.business_name || user?.name || undefined;
}

export async function getLocalDataSnapshot(): Promise<Snapshot> {
  const [
    rawUsers,
    rawMfcStaff,
    rawProducts,
    rawStockBatches,
    rawDailyBills,
    rawChalans,
    rawSaleTransactions,
    rawCustomerPayments,
    rawSellerPayments,
    rawManagerSpendings,
    rawQuotes,
    rawQuoteItems,
    customerBalances,
    sellerBalances,
  ] = await Promise.all([
    syncEngine.queryAll<RawUser>("SELECT * FROM users"),
    syncEngine.queryAll<RawMfcStaff>("SELECT * FROM mfc_staff"),
    syncEngine.queryAll<RawProduct>("SELECT * FROM products"),
    syncEngine.queryAll<RawStockBatch>("SELECT * FROM stock_batches"),
    syncEngine.queryAll<RawDailyBill>("SELECT * FROM daily_bills"),
    syncEngine.queryAll<RawChalan>("SELECT * FROM chalans"),
    syncEngine.queryAll<RawSaleTransaction>("SELECT * FROM sale_transactions"),
    syncEngine.queryAll<RawCustomerPayment>("SELECT * FROM customer_payments"),
    syncEngine.queryAll<RawSellerPayment>("SELECT * FROM seller_payments"),
    syncEngine.queryAll<RawManagerSpending>("SELECT * FROM manager_spendings"),
    syncEngine.queryAll<RawQuote>("SELECT * FROM quotes"),
    syncEngine.queryAll<RawQuoteItem>("SELECT * FROM quote_items"),
    syncEngine.queryAll<MobileCustomerBalance>("SELECT * FROM customer_balance"),
    syncEngine.queryAll<MobileSellerBalance>("SELECT * FROM seller_balance"),
  ]);

  const users: MobileUser[] = rawUsers.map((user) => ({
    ...user,
    is_active: toBoolean(user.is_active),
    address: parseJson(user.address),
  }));

  const mfcStaff: MobileMfcStaff[] = rawMfcStaff.map((staff) => ({
    ...staff,
    is_active: toBoolean(staff.is_active),
    is_default_admin: toBoolean(staff.is_default_admin),
  }));

  const products: MobileProduct[] = rawProducts.map((product) => ({
    ...product,
    is_stock_tracked: toBoolean(product.is_stock_tracked),
    created_by_name: null,
  }));

  const usersById = new Map(users.map((user) => [user.id, user]));
  const staffById = new Map(mfcStaff.map((staff) => [staff.id, staff]));
  const productsById = new Map(products.map((product) => [product.id, product]));

  const stockBatches: MobileStockBatch[] = rawStockBatches.map((batch) => ({
    ...batch,
    product_name: batch.product_id ? productsById.get(batch.product_id)?.name ?? null : null,
    supplier_name: batch.supplier_id ? userDisplayName(usersById.get(batch.supplier_id)) ?? null : null,
    created_by_name: batch.created_by ? staffById.get(batch.created_by)?.full_name ?? null : null,
  }));

  const dailyBills: MobileDailyBill[] = rawDailyBills.map((bill) => ({
    ...bill,
    is_migration_bill: toBoolean(bill.is_migration_bill),
    buyer_name: bill.customer_id ? userDisplayName(usersById.get(bill.customer_id)) ?? null : null,
    created_by_name: bill.created_by ? staffById.get(bill.created_by)?.full_name ?? null : null,
  }));

  const billsById = new Map(dailyBills.map((bill) => [bill.id, bill]));

  const chalans: MobileChalan[] = rawChalans.map((chalan) => ({
    ...chalan,
    seller_name: chalan.seller_id
      ? userDisplayName(usersById.get(chalan.seller_id)) ?? null
      : chalan.mfc_seller_id
        ? staffById.get(chalan.mfc_seller_id)?.full_name ?? null
        : null,
    created_by_name: chalan.created_by ? staffById.get(chalan.created_by)?.full_name ?? null : null,
  }));

  const saleTransactions: MobileSaleTransaction[] = rawSaleTransactions.map((transaction) => ({
    ...transaction,
    product_name: transaction.product_id
      ? productsById.get(transaction.product_id)?.name ?? null
      : null,
    bill_number: transaction.daily_bill_id
      ? billsById.get(transaction.daily_bill_id)?.bill_number ?? null
      : null,
    created_by_name: transaction.created_by
      ? staffById.get(transaction.created_by)?.full_name ?? null
      : null,
  }));

  const customerPayments: MobileCustomerPayment[] = rawCustomerPayments.map((payment) => ({
    ...payment,
    created_by_name: payment.created_by ? staffById.get(payment.created_by)?.full_name ?? null : null,
  }));

  const sellerPayments: MobileSellerPayment[] = rawSellerPayments.map((payment) => ({
    ...payment,
    created_by_name: payment.created_by ? staffById.get(payment.created_by)?.full_name ?? null : null,
  }));

  const managerSpendings: MobileManagerSpending[] = rawManagerSpendings.map((spending) => ({
    ...spending,
    created_by_name: spending.created_by ? staffById.get(spending.created_by)?.full_name ?? null : null,
  }));

  const quotes: MobileQuote[] = rawQuotes.map((quote) => ({
    ...quote,
    buyer_name: quote.customer_id ? userDisplayName(usersById.get(quote.customer_id)) ?? null : null,
    created_by_name: quote.created_by ? staffById.get(quote.created_by)?.full_name ?? null : null,
  }));

  const quoteItems: MobileQuoteItem[] = rawQuoteItems.map((item) => ({
    ...item,
    product_name: item.product_id ? productsById.get(item.product_id)?.name ?? null : null,
  }));

  return {
    users,
    mfcStaff,
    products,
    stockBatches,
    dailyBills,
    chalans,
    saleTransactions,
    customerPayments,
    sellerPayments,
    managerSpendings,
    quotes,
    quoteItems,
    customerBalances,
    sellerBalances,
    syncMetadata: [
      {
        table_name: "powersync",
        last_sync: syncEngine.getSyncStatus().lastFullSyncAt ?? "",
        status: syncEngine.getSyncStatus().isSubscribed ? "idle" : "syncing",
        error_message: syncEngine.getSyncStatus().lastError,
      },
    ],
  };
}

export function getUserDisplay(
  user?: { name: string; business_name: string | null } | null
): { name: string; businessName: string | null } {
  return {
    name: user?.name ?? "Unknown",
    businessName: user?.business_name ?? null,
  };
}
