import type {
  ManagerBillRecord,
  ManagerChalanRecord,
  ManagerCustomerBalanceRecord,
  ManagerCustomerPaymentRecord,
  ManagerSaleTransactionRecord,
  ManagerSellerBalanceRecord,
  ManagerSellerPaymentRecord,
  ManagerUserRecord,
} from "@mfc/manager-ui";

export type ManagerLedgersReadModel = {
  bills: ManagerBillRecord[];
  chalans: ManagerChalanRecord[];
  customerBalances: Array<ManagerCustomerBalanceRecord & { updated_at?: string | null }>;
  customerPayments: ManagerCustomerPaymentRecord[];
  saleTransactions: ManagerSaleTransactionRecord[];
  sellerBalances: Array<ManagerSellerBalanceRecord & { updated_at?: string | null }>;
  sellerPayments: ManagerSellerPaymentRecord[];
  users: ManagerUserRecord[];
};

export type LedgerTab = "customer" | "seller";

export type LedgerSummaryEntry = {
  businessName: string | null;
  currentDue: number;
  lastPaymentDate?: string;
  name: string;
  openItemCount: number;
  paidAmount: number;
  totalAmount: number;
  type: LedgerTab;
  updatedAt: string;
  userId: string;
};

export type CustomerLedgerHistoryRow = {
  billed: number;
  date: string;
  payment: number;
};

export type SellerLedgerHistoryRow = {
  date: string;
  netPayable: number;
  paid: number;
};

export type CustomerLedgerPurchaseRow = {
  billNumber: string;
  date: string;
  dueAmount: number;
  id: string;
  itemCount: number;
  itemSummary: string;
  paidAmount: number;
  totalAmount: number;
  totalWeight: number;
};

export type CustomerLedgerPaymentRow = {
  amount: number;
  billNumber: string;
  date: string;
  id: string;
  method: string;
};

export type DayLedgerDueEntry = {
  amount: number;
  reference: string;
};

export type DayCustomerLedgerRow = {
  businessName: string | null;
  customerId: string;
  displayName: string;
  name: string;
  oldDueTotal: number;
  olderDues: DayLedgerDueEntry[];
  outstandingAtClose: number;
  paymentToday: number;
  todayAmount: number;
  todayReference: string;
};

export type DayCustomerLedgerSections = {
  dueOnly: DayCustomerLedgerRow[];
  purchasedToday: DayCustomerLedgerRow[];
};

export type DaySellerLedgerRow = {
  name: string;
  olderDues: DayLedgerDueEntry[];
  paymentToday: number;
  sellerId: string;
  todayAmount: number;
  todayReference: string;
};

export type CustomerBillDetailRow = {
  amount: number;
  id: string;
  productLabel: string;
  rate: number;
  serialNo: number;
  weightKg: number;
};

export type CustomerBillDetailView = {
  amountPaid: number;
  billId: string;
  billNumber: string;
  businessName: string | null;
  customerId: string;
  date: string;
  dueAmount: number;
  lines: CustomerBillDetailRow[];
  name: string;
  totalAmount: number;
  totalWeight: number;
};

export type LedgerSearchUser = {
  business_name: string | null;
  id: string;
  is_active: boolean;
  name: string;
  phone?: string | null;
};

function asNumber(value: number | string | null | undefined): number {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

function getUserDisplay(user?: ManagerUserRecord): { businessName: string | null; name: string } {
  return {
    businessName: user?.business_name ?? null,
    name: user?.name ?? "Unknown",
  };
}

function buildCustomerLastPaymentMap(
  bills: ManagerBillRecord[],
  payments: ManagerCustomerPaymentRecord[]
): Map<string, string> {
  const billMap = new Map(bills.map((bill) => [bill.id, bill]));
  const map = new Map<string, string>();

  for (const payment of payments) {
    const bill = billMap.get(payment.daily_bill_id);
    if (!bill) {
      continue;
    }

    const current = map.get(bill.customer_id);
    if (!current || payment.payment_date > current) {
      map.set(bill.customer_id, payment.payment_date);
    }
  }

  return map;
}

function buildSellerLastPaymentMap(
  chalans: ManagerChalanRecord[],
  payments: ManagerSellerPaymentRecord[]
): Map<string, string> {
  const chalanMap = new Map(chalans.map((chalan) => [chalan.id, chalan]));
  const map = new Map<string, string>();

  for (const payment of payments) {
    const chalan = chalanMap.get(payment.chalan_id);
    if (!chalan?.seller_id) {
      continue;
    }

    const current = map.get(chalan.seller_id);
    if (!current || payment.payment_date > current) {
      map.set(chalan.seller_id, payment.payment_date);
    }
  }

  return map;
}

function filterBySearch(entries: LedgerSummaryEntry[], search: string): LedgerSummaryEntry[] {
  const query = search.trim().toLowerCase();
  if (!query) {
    return entries;
  }

  return entries.filter((entry) => {
    return (
      entry.name.toLowerCase().includes(query) ||
      entry.businessName?.toLowerCase().includes(query)
    );
  });
}

export function buildCustomerLedgerSummaries(
  model: ManagerLedgersReadModel,
  search = ""
): LedgerSummaryEntry[] {
  const userMap = new Map(model.users.map((user) => [user.id, user]));
  const customerLastPaymentMap = buildCustomerLastPaymentMap(model.bills, model.customerPayments);
  const openBillsByCustomer = new Map<string, ManagerBillRecord[]>();

  for (const bill of model.bills) {
    if (bill.status === "paid") {
      continue;
    }
    const list = openBillsByCustomer.get(bill.customer_id) ?? [];
    list.push(bill);
    openBillsByCustomer.set(bill.customer_id, list);
  }

  const entries = model.customerBalances
    .map((balance) => {
      const display = getUserDisplay(userMap.get(balance.user_id));
      return {
        businessName: display.businessName,
        currentDue: asNumber(balance.current_due),
        lastPaymentDate: customerLastPaymentMap.get(balance.user_id),
        name: display.name,
        openItemCount: openBillsByCustomer.get(balance.user_id)?.length ?? 0,
        paidAmount: asNumber(balance.total_paid),
        totalAmount: asNumber(balance.total_billed),
        type: "customer" as const,
        updatedAt: balance.updated_at ?? "",
        userId: balance.user_id,
      } satisfies LedgerSummaryEntry;
    })
    .sort((left, right) => {
      const dueCompare = right.currentDue - left.currentDue;
      if (dueCompare !== 0) {
        return dueCompare;
      }
      return (left.businessName || left.name).localeCompare(right.businessName || right.name);
    });

  return filterBySearch(entries, search);
}

export function getCustomerLedgerSummary(
  model: ManagerLedgersReadModel,
  userId: string
): LedgerSummaryEntry | undefined {
  return buildCustomerLedgerSummaries(model).find((entry) => entry.userId === userId);
}

export function buildSellerLedgerSummaries(
  model: ManagerLedgersReadModel,
  search = ""
): LedgerSummaryEntry[] {
  const userMap = new Map(model.users.map((user) => [user.id, user]));
  const sellerLastPaymentMap = buildSellerLastPaymentMap(model.chalans, model.sellerPayments);
  const openChalansBySeller = new Map<string, ManagerChalanRecord[]>();

  for (const chalan of model.chalans) {
    if (!chalan.seller_id || chalan.status === "paid") {
      continue;
    }
    const list = openChalansBySeller.get(chalan.seller_id) ?? [];
    list.push(chalan);
    openChalansBySeller.set(chalan.seller_id, list);
  }

  const entries = model.sellerBalances
    .map((balance) => {
      const display = getUserDisplay(userMap.get(balance.user_id));
      return {
        businessName: display.businessName,
        currentDue: asNumber(balance.current_due),
        lastPaymentDate: sellerLastPaymentMap.get(balance.user_id),
        name: display.name,
        openItemCount: openChalansBySeller.get(balance.user_id)?.length ?? 0,
        paidAmount: asNumber(balance.total_paid_out),
        totalAmount: asNumber(balance.total_earned),
        type: "seller" as const,
        updatedAt: balance.updated_at ?? "",
        userId: balance.user_id,
      } satisfies LedgerSummaryEntry;
    })
    .sort((left, right) => {
      const dueCompare = right.currentDue - left.currentDue;
      if (dueCompare !== 0) {
        return dueCompare;
      }
      return (left.businessName || left.name).localeCompare(right.businessName || right.name);
    });

  return filterBySearch(entries, search);
}

export function getSellerLedgerSummary(
  model: ManagerLedgersReadModel,
  userId: string
): LedgerSummaryEntry | undefined {
  return buildSellerLedgerSummaries(model).find((entry) => entry.userId === userId);
}

export function buildCustomerLedgerSearchUsers(model: ManagerLedgersReadModel): LedgerSearchUser[] {
  const billMap = new Map(model.bills.map((bill) => [bill.id, bill]));
  const customerIds = new Set<string>();

  for (const balance of model.customerBalances) {
    customerIds.add(balance.user_id);
  }
  for (const bill of model.bills) {
    customerIds.add(bill.customer_id);
  }
  for (const payment of model.customerPayments) {
    const bill = billMap.get(payment.daily_bill_id);
    if (bill) {
      customerIds.add(bill.customer_id);
    }
  }

  return model.users
    .filter((user) => customerIds.has(user.id))
    .map((user) => ({
      business_name: user.business_name,
      id: user.id,
      is_active: true,
      name: user.name,
      phone: user.phone ?? null,
    }))
    .sort((left, right) => (left.business_name || left.name).localeCompare(right.business_name || right.name));
}

export function buildSellerLedgerSearchUsers(model: ManagerLedgersReadModel): LedgerSearchUser[] {
  const chalanMap = new Map(model.chalans.map((chalan) => [chalan.id, chalan]));
  const sellerIds = new Set<string>();

  for (const balance of model.sellerBalances) {
    sellerIds.add(balance.user_id);
  }
  for (const chalan of model.chalans) {
    if (chalan.seller_id) {
      sellerIds.add(chalan.seller_id);
    }
  }
  for (const payment of model.sellerPayments) {
    const chalan = chalanMap.get(payment.chalan_id);
    if (chalan?.seller_id) {
      sellerIds.add(chalan.seller_id);
    }
  }

  return model.users
    .filter((user) => sellerIds.has(user.id))
    .map((user) => ({
      business_name: user.business_name,
      id: user.id,
      is_active: true,
      name: user.name,
      phone: user.phone ?? null,
    }))
    .sort((left, right) => (left.business_name || left.name).localeCompare(right.business_name || right.name));
}

export function buildCustomerHistoryRows(
  model: ManagerLedgersReadModel,
  userId: string
): CustomerLedgerHistoryRow[] {
  const customerBills = model.bills.filter((bill) => bill.customer_id === userId);
  const billIds = new Set(customerBills.map((bill) => bill.id));
  const rows = new Map<string, CustomerLedgerHistoryRow>();

  for (const bill of customerBills) {
    const current = rows.get(bill.bill_date) ?? { billed: 0, date: bill.bill_date, payment: 0 };
    current.billed += asNumber(bill.total_amount);
    rows.set(bill.bill_date, current);
  }
  for (const payment of model.customerPayments) {
    if (!billIds.has(payment.daily_bill_id)) {
      continue;
    }
    const current = rows.get(payment.payment_date) ?? { billed: 0, date: payment.payment_date, payment: 0 };
    current.payment += asNumber(payment.amount);
    rows.set(payment.payment_date, current);
  }

  return Array.from(rows.values()).sort((left, right) => right.date.localeCompare(left.date));
}

export function buildSellerHistoryRows(
  model: ManagerLedgersReadModel,
  userId: string
): SellerLedgerHistoryRow[] {
  const sellerChalans = model.chalans.filter((chalan) => chalan.seller_id === userId);
  const chalanIds = new Set(sellerChalans.map((chalan) => chalan.id));
  const rows = new Map<string, SellerLedgerHistoryRow>();

  for (const chalan of sellerChalans) {
    const current = rows.get(chalan.chalan_date) ?? { date: chalan.chalan_date, netPayable: 0, paid: 0 };
    current.netPayable += asNumber(chalan.net_payable);
    rows.set(chalan.chalan_date, current);
  }
  for (const payment of model.sellerPayments) {
    if (!chalanIds.has(payment.chalan_id)) {
      continue;
    }
    const current = rows.get(payment.payment_date) ?? { date: payment.payment_date, netPayable: 0, paid: 0 };
    current.paid += asNumber(payment.amount);
    rows.set(payment.payment_date, current);
  }

  return Array.from(rows.values()).sort((left, right) => right.date.localeCompare(left.date));
}

function summarizeItems(rows: ManagerSaleTransactionRecord[]): string {
  const labels = Array.from(new Set(rows.map((row) => row.product_description || "Sale item"))).filter(Boolean);
  if (labels.length === 0) {
    return "No items";
  }
  if (labels.length <= 2) {
    return labels.join(", ");
  }
  return `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
}

export function buildCustomerPurchaseRows(
  model: ManagerLedgersReadModel,
  userId: string
): CustomerLedgerPurchaseRow[] {
  const customerBills = model.bills
    .filter((bill) => bill.customer_id === userId)
    .sort((left, right) => right.bill_date.localeCompare(left.bill_date));
  const txByBill = new Map<string, ManagerSaleTransactionRecord[]>();

  for (const transaction of model.saleTransactions) {
    const list = txByBill.get(transaction.daily_bill_id) ?? [];
    list.push(transaction);
    txByBill.set(transaction.daily_bill_id, list);
  }

  return customerBills.map((bill) => {
    const txRows = txByBill.get(bill.id) ?? [];
    const totalWeight = txRows.reduce((sum, row) => sum + asNumber(row.weight_kg), 0);

    return {
      billNumber: bill.bill_number,
      date: bill.bill_date,
      dueAmount: Math.max(asNumber(bill.total_amount) - asNumber(bill.amount_paid), 0),
      id: bill.id,
      itemCount: txRows.length,
      itemSummary: summarizeItems(txRows),
      paidAmount: asNumber(bill.amount_paid),
      totalAmount: asNumber(bill.total_amount),
      totalWeight,
    };
  });
}

export function buildCustomerPaymentRows(
  model: ManagerLedgersReadModel,
  userId: string
): CustomerLedgerPaymentRow[] {
  const billMap = new Map(model.bills.map((bill) => [bill.id, bill]));
  const billIds = new Set(model.bills.filter((bill) => bill.customer_id === userId).map((bill) => bill.id));

  return model.customerPayments
    .filter((payment) => billIds.has(payment.daily_bill_id))
    .map((payment) => ({
      amount: asNumber(payment.amount),
      billNumber: billMap.get(payment.daily_bill_id)?.bill_number ?? payment.daily_bill_id,
      date: payment.payment_date,
      id: payment.id,
      method: payment.payment_method.replaceAll("_", " "),
    }))
    .sort((left, right) => right.date.localeCompare(left.date));
}

export function buildDayCustomerLedgerRows(
  model: ManagerLedgersReadModel,
  dateStr: string
): DayCustomerLedgerRow[] {
  const userMap = new Map(model.users.map((user) => [user.id, user]));
  const paymentsByCustomer = new Map<string, number>();
  const billMap = new Map(model.bills.map((bill) => [bill.id, bill]));

  for (const payment of model.customerPayments) {
    if (payment.payment_date !== dateStr) {
      continue;
    }
    const bill = billMap.get(payment.daily_bill_id);
    if (!bill) {
      continue;
    }
    paymentsByCustomer.set(bill.customer_id, (paymentsByCustomer.get(bill.customer_id) ?? 0) + asNumber(payment.amount));
  }

  const customerIds = new Set<string>();
  for (const bill of model.bills) {
    if (bill.bill_date === dateStr || bill.bill_date < dateStr) {
      customerIds.add(bill.customer_id);
    }
  }
  for (const customerId of paymentsByCustomer.keys()) {
    customerIds.add(customerId);
  }

  return Array.from(customerIds)
    .map((customerId) => {
      const display = getUserDisplay(userMap.get(customerId));
      const dayBills = model.bills
        .filter((bill) => bill.customer_id === customerId && bill.bill_date === dateStr)
        .sort((left, right) => left.bill_number.localeCompare(right.bill_number));
      const olderDueEntries = model.bills
        .filter((bill) => bill.customer_id === customerId && bill.bill_date < dateStr)
        .map((bill) => ({
          amount: Math.max(asNumber(bill.total_amount) - asNumber(bill.amount_paid), 0),
          date: bill.bill_date,
          reference: bill.bill_number,
        }))
        .filter((entry) => entry.amount > 0)
        .sort((left, right) => right.date.localeCompare(left.date));
      const olderDues = olderDueEntries.slice(0, 2).map(({ amount, reference }) => ({ amount, reference }));
      const firstDayBill = dayBills[0];
      const todayReference =
        dayBills.length === 0
          ? "No bill"
          : dayBills.length === 1
            ? (firstDayBill?.bill_number ?? "Bill")
            : `${firstDayBill?.bill_number ?? "Bill"} +${dayBills.length - 1}`;
      const todayAmount = dayBills.reduce((sum, bill) => sum + asNumber(bill.total_amount), 0);
      const oldDueTotal = olderDueEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const paymentToday = paymentsByCustomer.get(customerId) ?? 0;

      return {
        businessName: display.businessName,
        customerId,
        displayName: display.businessName || display.name,
        name: display.name,
        oldDueTotal,
        olderDues,
        outstandingAtClose: Math.max(oldDueTotal + todayAmount - paymentToday, 0),
        paymentToday,
        todayAmount,
        todayReference,
      };
    })
    .sort((left, right) => left.displayName.localeCompare(right.displayName));
}

export function buildDayCustomerLedgerSections(
  model: ManagerLedgersReadModel,
  dateStr: string
): DayCustomerLedgerSections {
  const rows = buildDayCustomerLedgerRows(model, dateStr);

  return {
    purchasedToday: rows
      .filter((row) => row.todayAmount > 0)
      .sort((left, right) => left.displayName.localeCompare(right.displayName)),
    dueOnly: rows
      .filter((row) => row.todayAmount <= 0 && row.oldDueTotal > 0 && row.outstandingAtClose > 0)
      .sort((left, right) => left.displayName.localeCompare(right.displayName)),
  };
}

export function buildDaySellerLedgerRows(
  model: ManagerLedgersReadModel,
  dateStr: string
): DaySellerLedgerRow[] {
  const userMap = new Map(model.users.map((user) => [user.id, user]));
  const paymentsBySeller = new Map<string, number>();
  const chalanMap = new Map(model.chalans.map((chalan) => [chalan.id, chalan]));

  for (const payment of model.sellerPayments) {
    if (payment.payment_date !== dateStr) {
      continue;
    }
    const chalan = chalanMap.get(payment.chalan_id);
    if (!chalan?.seller_id) {
      continue;
    }
    paymentsBySeller.set(chalan.seller_id, (paymentsBySeller.get(chalan.seller_id) ?? 0) + asNumber(payment.amount));
  }

  const sellerIds = new Set<string>();
  for (const chalan of model.chalans) {
    if (chalan.chalan_date === dateStr && chalan.seller_id) {
      sellerIds.add(chalan.seller_id);
    }
  }

  return Array.from(sellerIds)
    .map((sellerId) => {
      const display = getUserDisplay(userMap.get(sellerId));
      const dayChalans = model.chalans
        .filter((chalan) => chalan.seller_id === sellerId && chalan.chalan_date === dateStr)
        .sort((left, right) => left.chalan_number.localeCompare(right.chalan_number));
      const olderDues = model.chalans
        .filter((chalan) => chalan.seller_id === sellerId && chalan.chalan_date < dateStr)
        .map((chalan) => ({
          amount: Math.max(asNumber(chalan.net_payable) - asNumber(chalan.amount_paid), 0),
          date: chalan.chalan_date,
          reference: chalan.chalan_number,
        }))
        .filter((entry) => entry.amount > 0)
        .sort((left, right) => right.date.localeCompare(left.date))
        .slice(0, 2)
        .map(({ amount, reference }) => ({ amount, reference }));
      const firstDayChalan = dayChalans[0];
      const todayReference =
        dayChalans.length === 0
          ? "No chalan"
          : dayChalans.length === 1
            ? (firstDayChalan?.chalan_number ?? "Chalan")
            : `${firstDayChalan?.chalan_number ?? "Chalan"} +${dayChalans.length - 1}`;

      return {
        name: display.businessName || display.name,
        olderDues,
        paymentToday: paymentsBySeller.get(sellerId) ?? 0,
        sellerId,
        todayAmount: dayChalans.reduce((sum, chalan) => sum + asNumber(chalan.net_payable), 0),
        todayReference,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getCustomerBillDetail(
  model: ManagerLedgersReadModel,
  userId: string,
  billId: string
): CustomerBillDetailView | null {
  const bill = model.bills.find((row) => row.id === billId && row.customer_id === userId);
  if (!bill) {
    return null;
  }

  const user = model.users.find((row) => row.id === userId);
  const lines = model.saleTransactions
    .filter((row) => row.daily_bill_id === bill.id)
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((row, index) => ({
      amount: asNumber(row.amount),
      id: row.id,
      productLabel: row.product_description || "Sale item",
      rate: asNumber(row.price_per_kg),
      serialNo: index + 1,
      weightKg: asNumber(row.weight_kg),
    }));

  return {
    amountPaid: asNumber(bill.amount_paid),
    billId: bill.id,
    billNumber: bill.bill_number,
    businessName: user?.business_name ?? null,
    customerId: userId,
    date: bill.bill_date,
    dueAmount: Math.max(asNumber(bill.total_amount) - asNumber(bill.amount_paid), 0),
    lines,
    name: user?.name ?? "Unknown",
    totalAmount: asNumber(bill.total_amount),
    totalWeight: lines.reduce((sum, row) => sum + row.weightKg, 0),
  };
}
