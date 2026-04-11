export type ManagerUserRecord = {
  id: string;
  name: string;
  business_name: string | null;
  phone?: string | null;
};

export type ManagerStaffRecord = {
  id: string;
  full_name: string;
  role?: string | null;
  is_active?: boolean | number | null;
};

export type ManagerBillRecord = {
  id: string;
  bill_number: string;
  customer_id: string;
  bill_date: string;
  total_amount: number | string;
  amount_paid: number | string;
  status: string;
  buyer_name?: string | null;
};

export type ManagerCustomerPaymentRecord = {
  id: string;
  daily_bill_id: string;
  payment_date: string;
  amount: number | string;
  payment_method: string;
};

export type ManagerChalanRecord = {
  id: string;
  chalan_number: string;
  seller_id: string | null;
  seller_name?: string | null;
  mfc_seller_id?: string | null;
  chalan_date: string;
  total_sale_value: number | string;
  commission_amount: number | string;
  net_payable: number | string;
  amount_paid: number | string;
  status: string;
};

export type ManagerSellerPaymentRecord = {
  id: string;
  chalan_id: string;
  payment_date: string;
  amount: number | string;
  payment_method: string;
};

export type ManagerSaleTransactionRecord = {
  id: string;
  daily_bill_id: string;
  chalan_id: string;
  product_description: string | null;
  weight_kg: number | string;
  price_per_kg: number | string;
  amount: number | string;
};

export type ManagerCustomerBalanceRecord = {
  user_id: string;
  total_billed: number | string;
  total_paid: number | string;
  current_due: number | string;
};

export type ManagerSellerBalanceRecord = {
  user_id: string;
  total_earned: number | string;
  total_paid_out: number | string;
  current_due: number | string;
};

export type ManagerDueDateEntry = {
  amount: number;
  date: string;
  reference: string;
};

export type ManagerDueCollectionCard = {
  customerId: string;
  name: string;
  businessName: string | null;
  totalDueTillDate: number;
  selectedDateDue: number;
  selectedDatePayment: number;
  recentDueEntries: ManagerDueDateEntry[];
  latestDueDate: string | null;
  lastPaymentDate: string | null;
};

export type ManagerDueCollectionSections = {
  selectedDateCards: ManagerDueCollectionCard[];
  carryForwardCards: ManagerDueCollectionCard[];
};

export type ManagerBuyerPurchaseItemRow = {
  amount: number;
  id: string;
  label: string;
  pricePerKg: number;
  serialNo: number;
  weight: number;
};

export type ManagerBuyerPurchaseCard = {
  customerId: string;
  name: string;
  businessName: string | null;
  billEntries: Array<{
    billDate: string;
    billNumber: string;
  }>;
  billLabel: string;
  dateDue: number;
  datePayment: number;
  items: ManagerBuyerPurchaseItemRow[];
  paymentStatus: "paid" | "partial" | "due";
  showAddPayment: boolean;
  totalDueTillDate: number;
  totalPurchase: number;
  totalWeight: number;
};

export type ManagerChalanLine = {
  amount: number;
  billNumber: string;
  buyerName: string;
  id: string;
  label: string;
  pricePerKg: number;
  serialNo: number;
  weight: number;
};

export type ManagerChalanCard = {
  chalan: ManagerChalanRecord;
  deductionAmount: number;
  dueAmount: number;
  paymentStatus: "paid" | "partial" | "due";
  rows: ManagerChalanLine[];
  sellerName: string;
  showRecordPayout: boolean;
  totals: {
    commission: number;
    due: number;
    netPayable: number;
    paid: number;
    totalAmount: number;
    totalWeight: number;
  };
};

export type ManagerPaymentAccountCard = {
  businessName: string | null;
  lastPaymentDate: string | null;
  latestDueDate: string | null;
  name: string;
  openItemCount: number;
  recentDueEntries: ManagerDueDateEntry[];
  totalDue: number;
  userId: string;
};

export type ManagerPaymentHistoryRow = {
  amount: number;
  businessName: string | null;
  date: string;
  id: string;
  method: string;
  name: string;
  reference: string;
};

export type ManagerPaymentsOverview = {
  customerAccounts: ManagerPaymentAccountCard[];
  customerDueTotal: number;
  customerHistory: ManagerPaymentHistoryRow[];
  sellerAccounts: ManagerPaymentAccountCard[];
  sellerDueTotal: number;
  sellerHistory: ManagerPaymentHistoryRow[];
};

export type ManagerOperationsSummary = {
  buyerCards: ManagerBuyerPurchaseCard[];
  chalans: ManagerChalanCard[];
  dateStr: string;
  dueRegister: ManagerDueCollectionSections;
  verificationCards: ManagerChalanCard[];
};

export type ManagerOperationsReadModelInput = {
  bills: ManagerBillRecord[];
  chalans: ManagerChalanRecord[];
  customerPayments: ManagerCustomerPaymentRecord[];
  saleTransactions: ManagerSaleTransactionRecord[];
  sellerPayments: ManagerSellerPaymentRecord[];
  staff?: ManagerStaffRecord[];
  users: ManagerUserRecord[];
};

export type ManagerPaymentsReadModelInput = {
  bills: ManagerBillRecord[];
  chalans: ManagerChalanRecord[];
  customerBalances: ManagerCustomerBalanceRecord[];
  customerPayments: ManagerCustomerPaymentRecord[];
  sellerBalances: ManagerSellerBalanceRecord[];
  sellerPayments: ManagerSellerPaymentRecord[];
  users: ManagerUserRecord[];
};

function asNumber(value: number | string | null | undefined): number {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

function getUserDisplay(user?: ManagerUserRecord): { businessName: string | null; name: string } {
  return {
    name: user?.name ?? "Unknown",
    businessName: user?.business_name ?? null,
  };
}

function getSellerDisplay(
  chalan: ManagerChalanRecord,
  userMap: Map<string, ManagerUserRecord>,
  staffMap: Map<string, ManagerStaffRecord>
): string {
  if (chalan.seller_name?.trim()) {
    return chalan.seller_name.trim();
  }

  if (chalan.seller_id) {
    const seller = userMap.get(chalan.seller_id);
    if (seller) {
      return seller.business_name || seller.name;
    }
  }

  if (chalan.mfc_seller_id) {
    return staffMap.get(chalan.mfc_seller_id)?.full_name || "Unknown Seller";
  }

  return "Unknown Seller";
}

function buildRecentDueEntries<T extends { amount_paid: number | string; bill_date?: string; chalan_date?: string; total_amount?: number | string; net_payable?: number | string; bill_number?: string; chalan_number?: string }>(
  rows: T[],
  kind: "bill" | "chalan"
): ManagerDueDateEntry[] {
  return rows
    .map((row) => {
      const total =
        kind === "bill" ? asNumber(row.total_amount) : asNumber(row.net_payable);
      const due = Math.max(total - asNumber(row.amount_paid), 0);
      const date = kind === "bill" ? row.bill_date ?? "" : row.chalan_date ?? "";
      const reference = kind === "bill" ? row.bill_number ?? "" : row.chalan_number ?? "";

      return { amount: due, date, reference };
    })
    .filter((entry) => entry.amount > 0 && entry.date)
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 2);
}

function buildPaymentStatus(totalDue: number, totalBase: number): "paid" | "partial" | "due" {
  if (totalDue <= 0) {
    return "paid";
  }

  if (totalDue < totalBase) {
    return "partial";
  }

  return "due";
}

export function buildManagerOperationsSummary(
  dateStr: string,
  input: ManagerOperationsReadModelInput
): ManagerOperationsSummary {
  const userMap = new Map(input.users.map((user) => [user.id, user]));
  const staffMap = new Map((input.staff ?? []).map((staff) => [staff.id, staff]));
  const billMap = new Map(input.bills.map((bill) => [bill.id, bill]));
  const paymentsByBillId = new Map<string, ManagerCustomerPaymentRecord[]>();

  for (const payment of input.customerPayments) {
    const current = paymentsByBillId.get(payment.daily_bill_id) ?? [];
    current.push(payment);
    paymentsByBillId.set(payment.daily_bill_id, current);
  }

  const billsTillDate = input.bills.filter((bill) => bill.bill_date <= dateStr);
  const dayBills = input.bills.filter((bill) => bill.bill_date === dateStr);
  const paymentsTillDate = input.customerPayments.filter((payment) => payment.payment_date <= dateStr);
  const dayChalans = input.chalans.filter((chalan) => chalan.chalan_date === dateStr);
  const dayBillIds = new Set(dayBills.map((bill) => bill.id));
  const dayChalanIds = new Set(dayChalans.map((chalan) => chalan.id));
  const dayTransactions = input.saleTransactions.filter((transaction) =>
    dayBillIds.has(transaction.daily_bill_id)
  );
  const verificationTransactions = input.saleTransactions.filter((transaction) =>
    dayChalanIds.has(transaction.chalan_id)
  );

  const summaryMap = new Map<
    string,
    {
      customerId: string;
      latestDueDate: string | null;
      selectedDateDue: number;
      selectedDatePayment: number;
      totalBilledTillDate: number;
      totalPaidTillDate: number;
    }
  >();

  for (const bill of billsTillDate) {
    const current = summaryMap.get(bill.customer_id) ?? {
      customerId: bill.customer_id,
      latestDueDate: null,
      selectedDateDue: 0,
      selectedDatePayment: 0,
      totalBilledTillDate: 0,
      totalPaidTillDate: 0,
    };

    current.totalBilledTillDate += asNumber(bill.total_amount);
    if (bill.bill_date === dateStr) {
      current.selectedDateDue += asNumber(bill.total_amount);
    }
    if (
      Math.max(asNumber(bill.total_amount) - asNumber(bill.amount_paid), 0) > 0 &&
      (!current.latestDueDate || bill.bill_date > current.latestDueDate)
    ) {
      current.latestDueDate = bill.bill_date;
    }
    summaryMap.set(bill.customer_id, current);
  }

  for (const payment of paymentsTillDate) {
    const bill = billMap.get(payment.daily_bill_id);
    if (!bill) {
      continue;
    }

    const current = summaryMap.get(bill.customer_id) ?? {
      customerId: bill.customer_id,
      latestDueDate: null,
      selectedDateDue: 0,
      selectedDatePayment: 0,
      totalBilledTillDate: 0,
      totalPaidTillDate: 0,
    };

    current.totalPaidTillDate += asNumber(payment.amount);
    if (payment.payment_date === dateStr) {
      current.selectedDatePayment += asNumber(payment.amount);
    }
    summaryMap.set(bill.customer_id, current);
  }

  const allDueCards = Array.from(summaryMap.values())
    .map((entry) => {
      const display = getUserDisplay(userMap.get(entry.customerId));
      const openBills = input.bills
        .filter(
          (bill) =>
            bill.customer_id === entry.customerId &&
            Math.max(asNumber(bill.total_amount) - asNumber(bill.amount_paid), 0) > 0
        )
        .sort((left, right) => right.bill_date.localeCompare(left.bill_date));
      const customerPayments = (paymentsByBillId.get(openBills[0]?.id ?? "") ?? []).sort((left, right) =>
        right.payment_date.localeCompare(left.payment_date)
      );

      return {
        businessName: display.businessName,
        customerId: entry.customerId,
        lastPaymentDate: customerPayments[0]?.payment_date ?? null,
        latestDueDate: entry.latestDueDate,
        name: display.name,
        recentDueEntries: buildRecentDueEntries(openBills, "bill"),
        selectedDateDue: entry.selectedDateDue,
        selectedDatePayment: entry.selectedDatePayment,
        totalDueTillDate: Math.max(entry.totalBilledTillDate - entry.totalPaidTillDate, 0),
      } satisfies ManagerDueCollectionCard;
    })
    .filter((entry) => entry.totalDueTillDate > 0 || entry.selectedDatePayment > 0);

  const selectedDateCards = allDueCards
    .filter((card) => card.selectedDateDue > 0)
    .sort((left, right) =>
      (left.businessName || left.name).localeCompare(right.businessName || right.name)
    );

  const carryForwardCards = allDueCards
    .filter((card) => card.totalDueTillDate > 0 && card.selectedDateDue <= 0)
    .sort((left, right) => {
      const dateCompare = (right.latestDueDate ?? "").localeCompare(left.latestDueDate ?? "");
      if (dateCompare !== 0) {
        return dateCompare;
      }

      return (left.businessName || left.name).localeCompare(right.businessName || right.name);
    });

  const dueRowMap = new Map(allDueCards.map((card) => [card.customerId, card]));
  const buyerCardMap = new Map<
    string,
    {
      customerId: string;
      items: Omit<ManagerBuyerPurchaseItemRow, "serialNo">[];
      totalPurchase: number;
      totalWeight: number;
    }
  >();

  for (const bill of dayBills) {
    const current = buyerCardMap.get(bill.customer_id) ?? {
      customerId: bill.customer_id,
      items: [],
      totalPurchase: 0,
      totalWeight: 0,
    };
    current.totalPurchase += asNumber(bill.total_amount);
    buyerCardMap.set(bill.customer_id, current);
  }

  for (const transaction of dayTransactions) {
    const bill = billMap.get(transaction.daily_bill_id);
    if (!bill) {
      continue;
    }

    const current = buyerCardMap.get(bill.customer_id);
    if (!current) {
      continue;
    }

    const weight = asNumber(transaction.weight_kg);
    current.items.push({
      amount: asNumber(transaction.amount),
      id: transaction.id,
      label: transaction.product_description || "Sale item",
      pricePerKg: asNumber(transaction.price_per_kg),
      weight,
    });
    current.totalWeight += weight;
  }

  const buyerCards = Array.from(buyerCardMap.values())
    .map((entry) => {
      const display = getUserDisplay(userMap.get(entry.customerId));
      const billEntries = dayBills
        .filter((bill) => bill.customer_id === entry.customerId)
        .map((bill) => ({ billDate: bill.bill_date, billNumber: bill.bill_number }))
        .sort((left, right) => right.billDate.localeCompare(left.billDate));
      const dueCard = dueRowMap.get(entry.customerId);
      const billLabel =
        billEntries.length <= 1
          ? (billEntries[0]?.billNumber ?? "Bill")
          : `${billEntries[0]?.billNumber ?? "Bill"} +${billEntries.length - 1}`;
      const totalDueTillDate = dueCard?.totalDueTillDate ?? 0;
      const totalPurchase = entry.totalPurchase;

      return {
        billEntries,
        billLabel,
        businessName: display.businessName,
        customerId: entry.customerId,
        dateDue: dueCard?.selectedDateDue ?? 0,
        datePayment: dueCard?.selectedDatePayment ?? 0,
        items: entry.items.map((item, index) => ({
          ...item,
          serialNo: index + 1,
        })),
        name: display.name,
        paymentStatus: buildPaymentStatus(totalDueTillDate, totalPurchase),
        showAddPayment: totalDueTillDate > 0,
        totalDueTillDate,
        totalPurchase,
        totalWeight: entry.totalWeight,
      } satisfies ManagerBuyerPurchaseCard;
    })
    .sort((left, right) => {
      const dateCompare = (right.billEntries[0]?.billDate ?? "").localeCompare(left.billEntries[0]?.billDate ?? "");
      if (dateCompare !== 0) {
        return dateCompare;
      }

      return (left.businessName || left.name).localeCompare(right.businessName || right.name);
    });

  const buildChalanCard = (chalan: ManagerChalanRecord): ManagerChalanCard => {
    const rows = verificationTransactions
      .filter((transaction) => transaction.chalan_id === chalan.id)
      .map((transaction, index) => {
        const bill = billMap.get(transaction.daily_bill_id);
        const buyer = bill ? userMap.get(bill.customer_id) : undefined;

        return {
          amount: asNumber(transaction.amount),
          billNumber: bill?.bill_number ?? transaction.daily_bill_id,
          buyerName: bill?.buyer_name || buyer?.business_name || buyer?.name || "Unknown Buyer",
          id: transaction.id,
          label: transaction.product_description || "Sale item",
          pricePerKg: asNumber(transaction.price_per_kg),
          serialNo: index + 1,
          weight: asNumber(transaction.weight_kg),
        } satisfies ManagerChalanLine;
      });

    const totals = {
      commission: asNumber(chalan.commission_amount),
      due: Math.max(asNumber(chalan.net_payable) - asNumber(chalan.amount_paid), 0),
      netPayable: asNumber(chalan.net_payable),
      paid: asNumber(chalan.amount_paid),
      totalAmount: rows.reduce((sum, row) => sum + row.amount, 0),
      totalWeight: rows.reduce((sum, row) => sum + row.weight, 0),
    };

    return {
      chalan,
      deductionAmount: totals.commission,
      dueAmount: totals.due,
      paymentStatus: buildPaymentStatus(totals.due, totals.netPayable),
      rows,
      sellerName: getSellerDisplay(chalan, userMap, staffMap),
      showRecordPayout: totals.due > 0,
      totals,
    };
  };

  const chalanCards = dayChalans
    .sort((left, right) => left.chalan_number.localeCompare(right.chalan_number))
    .map(buildChalanCard);

  return {
    buyerCards,
    chalans: chalanCards,
    dateStr,
    dueRegister: {
      carryForwardCards,
      selectedDateCards,
    },
    verificationCards: chalanCards,
  };
}

export function buildManagerPaymentsOverview(
  search: string,
  input: ManagerPaymentsReadModelInput
): ManagerPaymentsOverview {
  const query = search.trim().toLowerCase();
  const userMap = new Map(input.users.map((user) => [user.id, user]));
  const billMap = new Map(input.bills.map((bill) => [bill.id, bill]));
  const chalanMap = new Map(input.chalans.map((chalan) => [chalan.id, chalan]));

  const customerPaymentsByUser = new Map<string, ManagerCustomerPaymentRecord[]>();
  const sellerPaymentsByUser = new Map<string, ManagerSellerPaymentRecord[]>();
  const billsByCustomer = new Map<string, ManagerBillRecord[]>();
  const chalansBySeller = new Map<string, ManagerChalanRecord[]>();

  for (const payment of input.customerPayments) {
    const bill = billMap.get(payment.daily_bill_id);
    if (!bill) {
      continue;
    }

    const current = customerPaymentsByUser.get(bill.customer_id) ?? [];
    current.push(payment);
    customerPaymentsByUser.set(bill.customer_id, current);
  }

  for (const payment of input.sellerPayments) {
    const chalan = chalanMap.get(payment.chalan_id);
    if (!chalan?.seller_id) {
      continue;
    }

    const current = sellerPaymentsByUser.get(chalan.seller_id) ?? [];
    current.push(payment);
    sellerPaymentsByUser.set(chalan.seller_id, current);
  }

  for (const bill of input.bills) {
    if (bill.status === "paid") {
      continue;
    }

    const current = billsByCustomer.get(bill.customer_id) ?? [];
    current.push(bill);
    billsByCustomer.set(bill.customer_id, current);
  }

  for (const chalan of input.chalans) {
    if (!chalan.seller_id || chalan.status === "paid") {
      continue;
    }

    const current = chalansBySeller.get(chalan.seller_id) ?? [];
    current.push(chalan);
    chalansBySeller.set(chalan.seller_id, current);
  }

  const customerAccounts = input.customerBalances
    .filter((balance) => asNumber(balance.current_due) > 0)
    .map((balance) => {
      const display = getUserDisplay(userMap.get(balance.user_id));
      const openBills = (billsByCustomer.get(balance.user_id) ?? []).sort((left, right) =>
        right.bill_date.localeCompare(left.bill_date)
      );
      const payments = (customerPaymentsByUser.get(balance.user_id) ?? []).sort((left, right) =>
        right.payment_date.localeCompare(left.payment_date)
      );

      return {
        businessName: display.businessName,
        lastPaymentDate: payments[0]?.payment_date ?? null,
        latestDueDate: openBills[0]?.bill_date ?? null,
        name: display.name,
        openItemCount: openBills.length,
        recentDueEntries: buildRecentDueEntries(openBills, "bill"),
        totalDue: asNumber(balance.current_due),
        userId: balance.user_id,
      } satisfies ManagerPaymentAccountCard;
    })
    .filter((row) => {
      if (!query) {
        return true;
      }

      const haystack = `${row.name} ${row.businessName ?? ""} ${row.recentDueEntries
        .map((entry) => entry.reference)
        .join(" ")}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((left, right) => {
      const dateCompare = (right.latestDueDate ?? "").localeCompare(left.latestDueDate ?? "");
      if (dateCompare !== 0) {
        return dateCompare;
      }

      return (left.businessName || left.name).localeCompare(right.businessName || right.name);
    });

  const sellerAccounts = input.sellerBalances
    .filter((balance) => asNumber(balance.current_due) > 0)
    .map((balance) => {
      const display = getUserDisplay(userMap.get(balance.user_id));
      const openChalans = (chalansBySeller.get(balance.user_id) ?? []).sort((left, right) =>
        right.chalan_date.localeCompare(left.chalan_date)
      );
      const payments = (sellerPaymentsByUser.get(balance.user_id) ?? []).sort((left, right) =>
        right.payment_date.localeCompare(left.payment_date)
      );

      return {
        businessName: display.businessName,
        lastPaymentDate: payments[0]?.payment_date ?? null,
        latestDueDate: openChalans[0]?.chalan_date ?? null,
        name: display.name,
        openItemCount: openChalans.length,
        recentDueEntries: buildRecentDueEntries(openChalans, "chalan"),
        totalDue: asNumber(balance.current_due),
        userId: balance.user_id,
      } satisfies ManagerPaymentAccountCard;
    })
    .filter((row) => {
      if (!query) {
        return true;
      }

      const haystack = `${row.name} ${row.businessName ?? ""} ${row.recentDueEntries
        .map((entry) => entry.reference)
        .join(" ")}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((left, right) => {
      const dateCompare = (right.latestDueDate ?? "").localeCompare(left.latestDueDate ?? "");
      if (dateCompare !== 0) {
        return dateCompare;
      }

      return (left.businessName || left.name).localeCompare(right.businessName || right.name);
    });

  const customerHistory = input.customerPayments
    .map((payment) => {
      const bill = billMap.get(payment.daily_bill_id);
      const display = getUserDisplay(bill ? userMap.get(bill.customer_id) : undefined);

      return {
        amount: asNumber(payment.amount),
        businessName: display.businessName,
        date: payment.payment_date,
        id: payment.id,
        method: payment.payment_method,
        name: display.name,
        reference: bill?.bill_number ?? payment.daily_bill_id,
      } satisfies ManagerPaymentHistoryRow;
    })
    .filter((row) => {
      if (!query) {
        return true;
      }

      const haystack = `${row.name} ${row.businessName ?? ""} ${row.reference}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((left, right) => right.date.localeCompare(left.date));

  const sellerHistory = input.sellerPayments
    .map((payment) => {
      const chalan = chalanMap.get(payment.chalan_id);
      const display = getUserDisplay(chalan?.seller_id ? userMap.get(chalan.seller_id) : undefined);

      return {
        amount: asNumber(payment.amount),
        businessName: display.businessName,
        date: payment.payment_date,
        id: payment.id,
        method: payment.payment_method,
        name: display.name,
        reference: chalan?.chalan_number ?? payment.chalan_id,
      } satisfies ManagerPaymentHistoryRow;
    })
    .filter((row) => {
      if (!query) {
        return true;
      }

      const haystack = `${row.name} ${row.businessName ?? ""} ${row.reference}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((left, right) => right.date.localeCompare(left.date));

  return {
    customerAccounts,
    customerDueTotal: customerAccounts.reduce((sum, account) => sum + account.totalDue, 0),
    customerHistory,
    sellerAccounts,
    sellerDueTotal: sellerAccounts.reduce((sum, account) => sum + account.totalDue, 0),
    sellerHistory,
  };
}
