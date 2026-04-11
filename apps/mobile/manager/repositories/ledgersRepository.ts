import {
  buildCustomerHistoryRows,
  buildCustomerLedgerSearchUsers,
  buildCustomerLedgerSummaries,
  buildCustomerPaymentRows,
  buildCustomerPurchaseRows,
  buildDayCustomerLedgerSections,
  buildDaySellerLedgerRows,
  buildSellerHistoryRows,
  buildSellerLedgerSearchUsers,
  buildSellerLedgerSummaries,
  getCustomerBillDetail,
  getCustomerLedgerSummary,
  getSellerLedgerSummary,
  type ManagerLedgersReadModel,
} from "@mfc/manager-workflows";

import { getLocalDataSnapshot, getUserDisplay } from "./shared";
import type {
  CustomerBillPageData,
  CustomerDayLedgerSections,
  CustomerLedgerDetailPageData,
  CustomerLedgerHistoryPageData,
  LedgerDetail,
  LedgerHistoryRow,
  LedgerSaleRow,
  LedgerSearchUser,
  LedgerSummaryRow,
  SellerDayLedgerRow,
  SellerLedgerHistoryPageData,
} from "./types";

function buildLedgersReadModel(
  snapshot: Awaited<ReturnType<typeof getLocalDataSnapshot>>
): ManagerLedgersReadModel {
  return {
    bills: snapshot.dailyBills,
    chalans: snapshot.chalans,
    customerBalances: snapshot.customerBalances,
    customerPayments: snapshot.customerPayments,
    saleTransactions: snapshot.saleTransactions,
    sellerBalances: snapshot.sellerBalances,
    sellerPayments: snapshot.sellerPayments,
    users: snapshot.users,
  };
}

function filterSearchUsers(users: LedgerSearchUser[], search: string): LedgerSearchUser[] {
  const query = search.trim().toLowerCase();
  if (!query) {
    return users;
  }

  return users.filter((user) => {
    return [user.business_name, user.name, user.phone]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query));
  });
}

export const ledgersRepository = {
  async getLedgers(search = ""): Promise<{
    customerLedgers: LedgerSummaryRow[];
    sellerLedgers: LedgerSummaryRow[];
    customerDueTotal: number;
    sellerDueTotal: number;
  }> {
    const snapshot = await getLocalDataSnapshot();
    const model = buildLedgersReadModel(snapshot);
    const customerLedgers = buildCustomerLedgerSummaries(model, search);
    const sellerLedgers = buildSellerLedgerSummaries(model, search);

    return {
      customerLedgers,
      sellerLedgers,
      customerDueTotal: customerLedgers.reduce((sum, row) => sum + row.currentDue, 0),
      sellerDueTotal: sellerLedgers.reduce((sum, row) => sum + row.currentDue, 0),
    };
  },

  async getLedgerSearchUsers(type: "customer" | "seller", search = ""): Promise<LedgerSearchUser[]> {
    const snapshot = await getLocalDataSnapshot();
    const model = buildLedgersReadModel(snapshot);

    return filterSearchUsers(
      type === "customer" ? buildCustomerLedgerSearchUsers(model) : buildSellerLedgerSearchUsers(model),
      search
    );
  },

  async getCustomerDayLedger(dateStr: string): Promise<CustomerDayLedgerSections> {
    const snapshot = await getLocalDataSnapshot();
    return buildDayCustomerLedgerSections(buildLedgersReadModel(snapshot), dateStr);
  },

  async getSellerDayLedger(dateStr: string): Promise<SellerDayLedgerRow[]> {
    const snapshot = await getLocalDataSnapshot();
    return buildDaySellerLedgerRows(buildLedgersReadModel(snapshot), dateStr);
  },

  async getCustomerLedgerDetailPage(userId: string): Promise<CustomerLedgerDetailPageData> {
    const snapshot = await getLocalDataSnapshot();
    const model = buildLedgersReadModel(snapshot);

    return {
      purchaseRows: userId ? buildCustomerPurchaseRows(model, userId) : [],
      searchUsers: buildCustomerLedgerSearchUsers(model),
      summary: userId ? getCustomerLedgerSummary(model, userId) : undefined,
    };
  },

  async getCustomerLedgerHistoryPage(userId: string): Promise<CustomerLedgerHistoryPageData> {
    const snapshot = await getLocalDataSnapshot();
    const model = buildLedgersReadModel(snapshot);

    return {
      historyRows: userId ? buildCustomerHistoryRows(model, userId) : [],
      searchUsers: buildCustomerLedgerSearchUsers(model),
      summary: userId ? getCustomerLedgerSummary(model, userId) : undefined,
    };
  },

  async getSellerLedgerHistoryPage(userId: string): Promise<SellerLedgerHistoryPageData> {
    const snapshot = await getLocalDataSnapshot();
    const model = buildLedgersReadModel(snapshot);

    return {
      historyRows: userId ? buildSellerHistoryRows(model, userId) : [],
      searchUsers: buildSellerLedgerSearchUsers(model),
      summary: userId ? getSellerLedgerSummary(model, userId) : undefined,
    };
  },

  async getCustomerBillPage(userId: string, billId: string): Promise<CustomerBillPageData> {
    const snapshot = await getLocalDataSnapshot();
    const model = buildLedgersReadModel(snapshot);

    return {
      bill: userId && billId ? getCustomerBillDetail(model, userId, billId) : null,
      searchUsers: buildCustomerLedgerSearchUsers(model),
      summary: userId ? getCustomerLedgerSummary(model, userId) : undefined,
    };
  },

  async getLedgerDetail(
    type: "customer" | "seller",
    userId: string,
    fromDate?: string,
    toDate?: string
  ): Promise<LedgerDetail | null> {
    const snapshot = await getLocalDataSnapshot();
    const model = buildLedgersReadModel(snapshot);

    const matchesDate = (value: string) => {
      if (fromDate && value < fromDate) {
        return false;
      }
      if (toDate && value > toDate) {
        return false;
      }
      return true;
    };

    if (type === "customer") {
      const summary = getCustomerLedgerSummary(model, userId);
      if (!summary) {
        return null;
      }

      const historyRows: LedgerHistoryRow[] = [
        ...buildCustomerPurchaseRows(model, userId).map((bill) => ({
          amount: bill.totalAmount,
          date: bill.date,
          id: `bill-${bill.id}`,
          kind: "Bill Raised",
          note: `${bill.itemCount} items • Paid ${bill.paidAmount.toFixed(0)}`,
          reference: bill.billNumber,
          tone: "outgoing" as const,
        })),
        ...buildCustomerPaymentRows(model, userId).map((payment) => ({
          amount: payment.amount,
          date: payment.date,
          id: `payment-${payment.id}`,
          kind: "Payment Received",
          note: payment.method,
          reference: payment.billNumber,
          tone: "incoming" as const,
        })),
      ]
        .filter((row) => matchesDate(row.date))
        .sort((a, b) => b.date.localeCompare(a.date));

      const saleRows: LedgerSaleRow[] = buildCustomerPurchaseRows(model, userId)
        .filter((row) => matchesDate(row.date))
        .map((row) => ({
          amount: row.totalAmount,
          date: row.date,
          id: row.id,
          label: row.itemSummary,
          pricePerKg: row.totalWeight > 0 ? row.totalAmount / row.totalWeight : 0,
          reference: row.billNumber,
          weight: row.totalWeight,
        }))
        .sort((a, b) => b.date.localeCompare(a.date));

      return {
        historyRows,
        saleRows,
        summary,
      };
    }

    const summary = getSellerLedgerSummary(model, userId);
    if (!summary) {
      return null;
    }

    const chalanMap = new Map(snapshot.chalans.map((chalan) => [chalan.id, chalan]));
    const sellerPayments = snapshot.sellerPayments
      .filter((payment) => chalanMap.get(payment.chalan_id)?.seller_id === userId)
      .map((payment) => ({
        amount: Number(payment.amount),
        date: payment.payment_date,
        id: `seller-payment-${payment.id}`,
        kind: "Payout Made",
        note: payment.payment_method.replaceAll("_", " "),
        reference: chalanMap.get(payment.chalan_id)?.chalan_number ?? payment.chalan_id,
        tone: "incoming" as const,
      }));
    const sellerChalans = snapshot.chalans
      .filter((chalan) => chalan.seller_id === userId)
      .map((chalan) => ({
        amount: Number(chalan.net_payable),
        date: chalan.chalan_date,
        id: `chalan-${chalan.id}`,
        kind: "Chalan Created",
        note: `${chalan.status.replaceAll("_", " ")} • Commission ${Number(chalan.commission_amount).toFixed(0)}`,
        reference: chalan.chalan_number,
        tone: "outgoing" as const,
      }));

    const historyRows: LedgerHistoryRow[] = [...sellerChalans, ...sellerPayments]
      .filter((row) => matchesDate(row.date))
      .sort((a, b) => b.date.localeCompare(a.date));

    const billMap = new Map(snapshot.dailyBills.map((bill) => [bill.id, bill]));
    const userMap = new Map(snapshot.users.map((user) => [user.id, user]));
    const chalanIds = new Set(snapshot.chalans.filter((chalan) => chalan.seller_id === userId).map((chalan) => chalan.id));

    const saleRows: LedgerSaleRow[] = snapshot.saleTransactions
      .filter((transaction) => transaction.chalan_id && chalanIds.has(transaction.chalan_id))
      .map((transaction) => {
        const bill = transaction.daily_bill_id ? billMap.get(transaction.daily_bill_id) : undefined;
        const buyer = bill ? userMap.get(bill.customer_id) : undefined;
        const chalan = transaction.chalan_id ? chalanMap.get(transaction.chalan_id) : undefined;

        return {
          amount: Number(transaction.amount),
          date: chalan?.chalan_date ?? transaction.updated_at.slice(0, 10),
          id: transaction.id,
          label: bill?.buyer_name || getUserDisplay(buyer).businessName || getUserDisplay(buyer).name,
          pricePerKg: Number(transaction.price_per_kg),
          reference: chalan?.chalan_number ?? transaction.chalan_id ?? transaction.id,
          weight: Number(transaction.weight_kg),
        };
      })
      .filter((row) => matchesDate(row.date))
      .sort((a, b) => b.date.localeCompare(a.date));

    return {
      historyRows,
      saleRows,
      summary,
    };
  },
};
