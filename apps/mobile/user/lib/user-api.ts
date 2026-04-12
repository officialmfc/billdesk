import { supabase } from "@/lib/supabase";
import {
  clearLocalCache,
  deleteFromCachedCollection,
  getCachedCollection,
  getLastSync,
  mergeCachedCollection,
  setLastSync,
} from "@/lib/local-cache";

export type UserProfile = {
  address: Record<string, unknown> | null;
  businessName: string | null;
  defaultRole: "buyer" | "seller";
  id: string;
  name: string;
  phone: string | null;
  userType: "business" | "vendor";
};

export type BuyerBillSummary = {
  amountPaid: number;
  billDate: string;
  billNumber: string;
  id: string;
  items: Array<{
    amount: number;
    description: string;
    id: string;
    pricePerKg: number;
    weightKg: number;
  }>;
  status: string;
  totalAmount: number;
};

export type SellerChalanSummary = {
  amountPaid: number;
  chalanDate: string;
  chalanNumber: string;
  commissionAmount: number;
  id: string;
  items: Array<{
    amount: number;
    description: string;
    id: string;
    pricePerKg: number;
    weightKg: number;
  }>;
  netPayable: number;
  status: string;
  totalSaleValue: number;
};

export type UserTodayData = {
  buyerBills: BuyerBillSummary[];
  currentCustomerDue: number;
  currentSellerDue: number;
  sellerChalans: SellerChalanSummary[];
};

export type UserHistoryRow = {
  amount: number;
  billId?: string | null;
  chalanId?: string | null;
  date: string;
  kind: "bill" | "payment" | "chalan" | "payout";
  reference: string;
};

export type UserBillDetail = {
  amountPaid: number;
  billDate: string;
  billNumber: string;
  dueAmount: number;
  id: string;
  lines: Array<{
    amount: number;
    description: string;
    id: string;
    pricePerKg: number;
    serialNo: number;
    weightKg: number;
  }>;
  status: string;
  totalAmount: number;
  totalWeight: number;
};

type CachedUserRow = {
  address: string | null;
  auth_user_id: string | null;
  business_name: string | null;
  default_role: "buyer" | "seller" | null;
  id: string;
  name: string;
  phone: string | null;
  updated_at: string;
  user_type: "business" | "vendor" | null;
};

type CachedDailyBillRow = {
  amount_paid: number | string | null;
  bill_date: string;
  bill_number: string;
  customer_id: string;
  id: string;
  status: string;
  total_amount: number | string | null;
  updated_at: string;
};

type CachedChalanRow = {
  amount_paid: number | string | null;
  chalan_date: string;
  chalan_number: string;
  commission_amount: number | string | null;
  id: string;
  net_payable: number | string | null;
  seller_id: string | null;
  status: string;
  total_sale_value: number | string | null;
  updated_at: string;
};

type CachedSaleTransactionRow = {
  amount: number | string | null;
  chalan_id: string | null;
  daily_bill_id: string | null;
  id: string;
  price_per_kg: number | string | null;
  product_description: string | null;
  updated_at: string;
  weight_kg: number | string | null;
};

type CachedCustomerPaymentRow = {
  amount: number | string | null;
  daily_bill_id: string;
  id: string;
  payment_date: string;
  updated_at: string;
};

type CachedSellerPaymentRow = {
  amount: number | string | null;
  chalan_id: string;
  id: string;
  payment_date: string;
  updated_at: string;
};

type CachedBalanceRow = {
  current_due: number | string | null;
  updated_at: string;
  user_id: string;
};

type DeletedRecordRow = {
  deleted_at: string;
  record_id: string;
  table_name: string;
};

const CACHE_KEYS = {
  chalans: "chalans",
  customerBalance: "customer_balance",
  customerPayments: "customer_payments",
  dailyBills: "daily_bills",
  saleTransactions: "sale_transactions",
  sellerBalance: "seller_balance",
  sellerPayments: "seller_payments",
  users: "users",
} as const;

type SyncCheckpointMap = Map<string, string>;

function asNumber(value: unknown): number {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
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

async function getSessionUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user ?? null;
}

function getLatestTimestamp<T extends Record<string, unknown>>(
  rows: T[],
  field: keyof T
): string | null {
  let latest: string | null = null;

  for (const row of rows) {
    const value = row[field];
    if (typeof value !== "string" || value.length === 0) {
      continue;
    }

    if (!latest || value > latest) {
      latest = value;
    }
  }

  return latest;
}

async function applyIncrementalSync<T extends Record<string, unknown>>(
  tableName: string,
  primaryKey: keyof T,
  cursorField: keyof T,
  checkpoints: SyncCheckpointMap,
  fetcher: (lastSync: string | null) => Promise<T[]>
) {
  const lastSync = await getLastSync(tableName);
  const rows = await fetcher(lastSync);

  if (rows.length > 0) {
    await mergeCachedCollection<T>(tableName, rows, primaryKey);
  }

  const latestTimestamp = getLatestTimestamp(rows, cursorField);
  if (latestTimestamp) {
    checkpoints.set(tableName, latestTimestamp);
  }
}

async function syncProfile(authUserId: string, checkpoints: SyncCheckpointMap) {
  await applyIncrementalSync<CachedUserRow>(
    CACHE_KEYS.users,
    "id",
    "updated_at",
    checkpoints,
    async (lastSync) => {
    let query = supabase
      .from("users")
      .select("id, auth_user_id, name, business_name, phone, default_role, user_type, address, updated_at")
      .eq("auth_user_id", authUserId);

    if (lastSync) {
      query = query.gt("updated_at", lastSync);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

      return (data ?? []) as CachedUserRow[];
    }
  );
}

async function getCachedCurrentUser(authUserId: string): Promise<CachedUserRow | null> {
  const rows = await getCachedCollection<CachedUserRow>(CACHE_KEYS.users);
  return rows.find((row) => row.auth_user_id === authUserId) ?? null;
}

async function syncTopLevelTables(userId: string, checkpoints: SyncCheckpointMap) {
  await Promise.all([
    applyIncrementalSync<CachedDailyBillRow>(
      CACHE_KEYS.dailyBills,
      "id",
      "updated_at",
      checkpoints,
      async (lastSync) => {
      let query = supabase
        .from("daily_bills")
        .select("id, customer_id, bill_number, bill_date, total_amount, amount_paid, status, updated_at")
        .eq("customer_id", userId);

      if (lastSync) {
        query = query.gt("updated_at", lastSync);
      }

      const { data, error } = await query.order("bill_date", { ascending: false });
      if (error) {
        throw new Error(error.message);
      }
      return (data ?? []) as CachedDailyBillRow[];
      }
    ),
    applyIncrementalSync<CachedChalanRow>(
      CACHE_KEYS.chalans,
      "id",
      "updated_at",
      checkpoints,
      async (lastSync) => {
      let query = supabase
        .from("chalans")
        .select("id, seller_id, chalan_number, chalan_date, total_sale_value, commission_amount, net_payable, amount_paid, status, updated_at")
        .eq("seller_id", userId);

      if (lastSync) {
        query = query.gt("updated_at", lastSync);
      }

      const { data, error } = await query.order("chalan_date", { ascending: false });
      if (error) {
        throw new Error(error.message);
      }
      return (data ?? []) as CachedChalanRow[];
      }
    ),
    applyIncrementalSync<CachedBalanceRow>(
      CACHE_KEYS.customerBalance,
      "user_id",
      "updated_at",
      checkpoints,
      async (lastSync) => {
      let query = supabase
        .from("customer_balance")
        .select("user_id, current_due, updated_at")
        .eq("user_id", userId);

      if (lastSync) {
        query = query.gt("updated_at", lastSync);
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(error.message);
      }
      return (data ?? []) as CachedBalanceRow[];
      }
    ),
    applyIncrementalSync<CachedBalanceRow>(
      CACHE_KEYS.sellerBalance,
      "user_id",
      "updated_at",
      checkpoints,
      async (lastSync) => {
      let query = supabase
        .from("seller_balance")
        .select("user_id, current_due, updated_at")
        .eq("user_id", userId);

      if (lastSync) {
        query = query.gt("updated_at", lastSync);
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(error.message);
      }
      return (data ?? []) as CachedBalanceRow[];
      }
    ),
  ]);
}

async function syncBillChildren(billIds: string[], checkpoints: SyncCheckpointMap) {
  await Promise.all([
    applyIncrementalSync<CachedCustomerPaymentRow>(
      CACHE_KEYS.customerPayments,
      "id",
      "updated_at",
      checkpoints,
      async (lastSync) => {
        if (billIds.length === 0) {
          return [];
        }

        let query = supabase
          .from("customer_payments")
          .select("id, daily_bill_id, payment_date, amount, updated_at")
          .in("daily_bill_id", billIds);

        if (lastSync) {
          query = query.gt("updated_at", lastSync);
        }

        const { data, error } = await query.order("payment_date", { ascending: false });
        if (error) {
          throw new Error(error.message);
        }
        return (data ?? []) as CachedCustomerPaymentRow[];
      }
    ),
    applyIncrementalSync<CachedSaleTransactionRow>(
      CACHE_KEYS.saleTransactions,
      "id",
      "updated_at",
      checkpoints,
      async (lastSync) => {
        if (billIds.length === 0) {
          return [];
        }

        let query = supabase
          .from("sale_transactions")
          .select("id, daily_bill_id, chalan_id, product_description, weight_kg, price_per_kg, amount, updated_at")
          .in("daily_bill_id", billIds);

        if (lastSync) {
          query = query.gt("updated_at", lastSync);
        }

        const { data, error } = await query;
        if (error) {
          throw new Error(error.message);
        }
        return (data ?? []) as CachedSaleTransactionRow[];
      }
    ),
  ]);
}

async function syncChalanChildren(chalanIds: string[], checkpoints: SyncCheckpointMap) {
  await Promise.all([
    applyIncrementalSync<CachedSellerPaymentRow>(
      CACHE_KEYS.sellerPayments,
      "id",
      "updated_at",
      checkpoints,
      async (lastSync) => {
        if (chalanIds.length === 0) {
          return [];
        }

        let query = supabase
          .from("seller_payments")
          .select("id, chalan_id, payment_date, amount, updated_at")
          .in("chalan_id", chalanIds);

        if (lastSync) {
          query = query.gt("updated_at", lastSync);
        }

        const { data, error } = await query.order("payment_date", { ascending: false });
        if (error) {
          throw new Error(error.message);
        }
        return (data ?? []) as CachedSellerPaymentRow[];
      }
    ),
    applyIncrementalSync<CachedSaleTransactionRow>(
      CACHE_KEYS.saleTransactions,
      "id",
      "updated_at",
      checkpoints,
      async (lastSync) => {
        if (chalanIds.length === 0) {
          return [];
        }

        let query = supabase
          .from("sale_transactions")
          .select("id, daily_bill_id, chalan_id, product_description, weight_kg, price_per_kg, amount, updated_at")
          .in("chalan_id", chalanIds);

        if (lastSync) {
          query = query.gt("updated_at", lastSync);
        }

        const { data, error } = await query;
        if (error) {
          throw new Error(error.message);
        }
        return (data ?? []) as CachedSaleTransactionRow[];
      }
    ),
  ]);
}

async function syncDeletedRecords(checkpoints: SyncCheckpointMap) {
  const lastSync = await getLastSync("deleted_records");
  let query = supabase
    .from("deleted_records")
    .select("table_name, record_id, deleted_at");

  if (lastSync) {
    query = query.gt("deleted_at", lastSync);
  }

  const { data, error } = await query.order("deleted_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as DeletedRecordRow[];
  const idsByTable = rows.reduce<Record<string, string[]>>((accumulator, row) => {
    if (!accumulator[row.table_name]) {
      accumulator[row.table_name] = [];
    }
    accumulator[row.table_name].push(row.record_id);
    return accumulator;
  }, {});

  await Promise.all([
    deleteFromCachedCollection<CachedDailyBillRow>(
      CACHE_KEYS.dailyBills,
      idsByTable.daily_bills ?? [],
      "id"
    ),
    deleteFromCachedCollection<CachedChalanRow>(
      CACHE_KEYS.chalans,
      idsByTable.chalans ?? [],
      "id"
    ),
    deleteFromCachedCollection<CachedSaleTransactionRow>(
      CACHE_KEYS.saleTransactions,
      idsByTable.sale_transactions ?? [],
      "id"
    ),
    deleteFromCachedCollection<CachedCustomerPaymentRow>(
      CACHE_KEYS.customerPayments,
      idsByTable.customer_payments ?? [],
      "id"
    ),
    deleteFromCachedCollection<CachedSellerPaymentRow>(
      CACHE_KEYS.sellerPayments,
      idsByTable.seller_payments ?? [],
      "id"
    ),
  ]);

  const latestDeletedAt = getLatestTimestamp(rows, "deleted_at");
  if (latestDeletedAt) {
    checkpoints.set("deleted_records", latestDeletedAt);
  }
}

async function commitSyncCheckpoints(checkpoints: SyncCheckpointMap): Promise<void> {
  await Promise.all(
    Array.from(checkpoints.entries()).map(([tableName, value]) => setLastSync(tableName, value))
  );
}

function toUserProfile(row: CachedUserRow | null): UserProfile | null {
  if (!row?.id || !row.name) {
    return null;
  }

  return {
    address: parseJson<Record<string, unknown>>(row.address),
    businessName: row.business_name ?? null,
    defaultRole: row.default_role ?? "buyer",
    id: row.id,
    name: row.name,
    phone: row.phone ?? null,
    userType: row.user_type ?? "business",
  };
}

export function getCurrentDateIST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function syncCurrentUserData(authUserId?: string): Promise<void> {
  const authUser = authUserId ? { id: authUserId } : await getSessionUser();

  if (!authUser) {
    return;
  }

  const checkpoints: SyncCheckpointMap = new Map();

  await syncProfile(authUser.id, checkpoints);

  const cachedUser = await getCachedCurrentUser(authUser.id);
  if (!cachedUser?.id) {
    return;
  }

  await syncTopLevelTables(cachedUser.id, checkpoints);

  const [cachedBills, cachedChalans] = await Promise.all([
    getCachedCollection<CachedDailyBillRow>(CACHE_KEYS.dailyBills),
    getCachedCollection<CachedChalanRow>(CACHE_KEYS.chalans),
  ]);

  const billIds = cachedBills
    .filter((row) => row.customer_id === cachedUser.id)
    .map((row) => row.id);
  const chalanIds = cachedChalans
    .filter((row) => row.seller_id === cachedUser.id)
    .map((row) => row.id);

  await Promise.all([
    syncBillChildren(billIds, checkpoints),
    syncChalanChildren(chalanIds, checkpoints),
  ]);
  await syncDeletedRecords(checkpoints);
  await commitSyncCheckpoints(checkpoints);
}

export async function getCurrentUserProfile(authUserId?: string): Promise<UserProfile | null> {
  const authUser = authUserId ? { id: authUserId } : await getSessionUser();

  if (!authUser) {
    return null;
  }

  return toUserProfile(await getCachedCurrentUser(authUser.id));
}

export async function getUserTodayData(userId: string, dateStr: string): Promise<UserTodayData> {
  const [buyerBills, sellerChalans, saleItems, customerBalances, sellerBalances] =
    await Promise.all([
      getCachedCollection<CachedDailyBillRow>(CACHE_KEYS.dailyBills),
      getCachedCollection<CachedChalanRow>(CACHE_KEYS.chalans),
      getCachedCollection<CachedSaleTransactionRow>(CACHE_KEYS.saleTransactions),
      getCachedCollection<CachedBalanceRow>(CACHE_KEYS.customerBalance),
      getCachedCollection<CachedBalanceRow>(CACHE_KEYS.sellerBalance),
    ]);

  const filteredBills = buyerBills
    .filter((bill) => bill.customer_id === userId && bill.bill_date === dateStr)
    .sort((left, right) => left.bill_number.localeCompare(right.bill_number));

  const filteredChalans = sellerChalans
    .filter((chalan) => chalan.seller_id === userId && chalan.chalan_date === dateStr)
    .sort((left, right) => left.chalan_number.localeCompare(right.chalan_number));

  return {
    buyerBills: filteredBills.map((bill) => ({
      amountPaid: asNumber(bill.amount_paid),
      billDate: bill.bill_date,
      billNumber: bill.bill_number,
      id: bill.id,
      items: saleItems
        .filter((item) => item.daily_bill_id === bill.id)
        .map((item) => ({
          amount: asNumber(item.amount),
          description: item.product_description ?? "Item",
          id: item.id,
          pricePerKg: asNumber(item.price_per_kg),
          weightKg: asNumber(item.weight_kg),
        })),
      status: bill.status,
      totalAmount: asNumber(bill.total_amount),
    })),
    currentCustomerDue:
      asNumber(customerBalances.find((row) => row.user_id === userId)?.current_due),
    currentSellerDue:
      asNumber(sellerBalances.find((row) => row.user_id === userId)?.current_due),
    sellerChalans: filteredChalans.map((chalan) => ({
      amountPaid: asNumber(chalan.amount_paid),
      chalanDate: chalan.chalan_date,
      chalanNumber: chalan.chalan_number,
      commissionAmount: asNumber(chalan.commission_amount),
      id: chalan.id,
      items: saleItems
        .filter((item) => item.chalan_id === chalan.id)
        .map((item) => ({
          amount: asNumber(item.amount),
          description: item.product_description ?? "Item",
          id: item.id,
          pricePerKg: asNumber(item.price_per_kg),
          weightKg: asNumber(item.weight_kg),
        })),
      netPayable: asNumber(chalan.net_payable),
      status: chalan.status,
      totalSaleValue: asNumber(chalan.total_sale_value),
    })),
  };
}

export async function getUserHistory(userId: string): Promise<UserHistoryRow[]> {
  const [bills, chalans, customerPayments, sellerPayments] = await Promise.all([
    getCachedCollection<CachedDailyBillRow>(CACHE_KEYS.dailyBills),
    getCachedCollection<CachedChalanRow>(CACHE_KEYS.chalans),
    getCachedCollection<CachedCustomerPaymentRow>(CACHE_KEYS.customerPayments),
    getCachedCollection<CachedSellerPaymentRow>(CACHE_KEYS.sellerPayments),
  ]);

  const filteredBills = bills.filter((bill) => bill.customer_id === userId);
  const filteredChalans = chalans.filter((chalan) => chalan.seller_id === userId);
  const billLookup = new Map(filteredBills.map((bill) => [bill.id, bill]));
  const chalanLookup = new Map(filteredChalans.map((chalan) => [chalan.id, chalan]));

  const rows: UserHistoryRow[] = [
    ...filteredBills.map((bill) => ({
      amount: asNumber(bill.total_amount),
      billId: bill.id,
      chalanId: null,
      date: bill.bill_date,
      kind: "bill" as const,
      reference: bill.bill_number,
    })),
    ...customerPayments
      .filter((payment) => billLookup.has(payment.daily_bill_id))
      .map((payment) => ({
        amount: asNumber(payment.amount),
        billId: payment.daily_bill_id,
        chalanId: null,
        date: payment.payment_date,
        kind: "payment" as const,
        reference: billLookup.get(payment.daily_bill_id)?.bill_number ?? "Bill payment",
      })),
    ...filteredChalans.map((chalan) => ({
      amount: asNumber(chalan.net_payable),
      billId: null,
      chalanId: chalan.id,
      date: chalan.chalan_date,
      kind: "chalan" as const,
      reference: chalan.chalan_number,
    })),
    ...sellerPayments
      .filter((payment) => chalanLookup.has(payment.chalan_id))
      .map((payment) => ({
        amount: asNumber(payment.amount),
        billId: null,
        chalanId: payment.chalan_id,
        date: payment.payment_date,
        kind: "payout" as const,
        reference: chalanLookup.get(payment.chalan_id)?.chalan_number ?? "Seller payout",
      })),
  ];

  return rows.sort((left, right) => right.date.localeCompare(left.date));
}

export async function getUserBillDetail(
  userId: string,
  billId: string
): Promise<UserBillDetail | null> {
  const [bills, saleItems] = await Promise.all([
    getCachedCollection<CachedDailyBillRow>(CACHE_KEYS.dailyBills),
    getCachedCollection<CachedSaleTransactionRow>(CACHE_KEYS.saleTransactions),
  ]);

  const bill = bills.find((entry) => entry.id === billId && entry.customer_id === userId);
  if (!bill) {
    return null;
  }

  const lines = saleItems
    .filter((item) => item.daily_bill_id === bill.id)
    .map((item, index) => ({
      amount: asNumber(item.amount),
      description: item.product_description ?? "Item",
      id: item.id,
      pricePerKg: asNumber(item.price_per_kg),
      serialNo: index + 1,
      weightKg: asNumber(item.weight_kg),
    }));

  return {
    amountPaid: asNumber(bill.amount_paid),
    billDate: bill.bill_date,
    billNumber: bill.bill_number,
    dueAmount: Math.max(asNumber(bill.total_amount) - asNumber(bill.amount_paid), 0),
    id: bill.id,
    lines,
    status: bill.status,
    totalAmount: asNumber(bill.total_amount),
    totalWeight: lines.reduce((sum, line) => sum + line.weightKg, 0),
  };
}

export async function updateMyProfile(input: {
  address?: Record<string, unknown> | null;
  businessName?: string | null;
  defaultRole?: "buyer" | "seller";
  name?: string | null;
  phone?: string | null;
}) {
  const { data, error } = await supabase.rpc("update_my_profile", {
    p_name: input.name ?? null,
    p_business_name: input.businessName ?? null,
    p_phone: input.phone ?? null,
    p_address: input.address ?? null,
    p_default_role: input.defaultRole ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  await syncCurrentUserData();
  return data;
}

export async function clearUserAppCache() {
  await clearLocalCache();
}
