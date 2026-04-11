import { getTodayDateString } from "@/lib/formatters";

import { getLocalDataSnapshot } from "./shared";
import type { HomeSnapshot } from "./types";

export const dashboardRepository = {
  async getHomeSnapshot(dateStr = getTodayDateString(), managerId?: string | null): Promise<HomeSnapshot> {
    const {
      dailyBills,
      saleTransactions,
      customerPayments,
      chalans,
    } = await getLocalDataSnapshot();

    const dayBills = dailyBills.filter(
      (bill) => bill.bill_date === dateStr && Boolean(managerId) && bill.created_by === managerId
    );
    const dayPayments = customerPayments.filter(
      (payment) =>
        payment.payment_date === dateStr &&
        Boolean(managerId) &&
        payment.created_by === managerId
    );
    const dayChalans = chalans.filter(
      (chalan) =>
        chalan.chalan_date === dateStr &&
        Boolean(managerId) &&
        chalan.created_by === managerId
    );
    const transactionsByBillId = new Map<string, typeof saleTransactions>();

    for (const transaction of saleTransactions) {
      const list = transactionsByBillId.get(transaction.daily_bill_id) ?? [];
      list.push(transaction);
      transactionsByBillId.set(transaction.daily_bill_id, list);
    }

    const auctionBills = dayBills.filter((bill) => {
      const billTransactions = transactionsByBillId.get(bill.id) ?? [];
      return billTransactions.some((transaction) => transaction.sale_type === "auction");
    });

    const mfcBills = dayBills.filter((bill) => {
      const billTransactions = transactionsByBillId.get(bill.id) ?? [];
      return billTransactions.some(
        (transaction) =>
          transaction.sale_type === "direct_sell" || Boolean(transaction.stock_batch_id)
      );
    });

    return {
      auctionSales: auctionBills.reduce((sum, bill) => sum + Number(bill.total_amount), 0),
      auctionBills: auctionBills.length,
      mfcSales: mfcBills.reduce((sum, bill) => sum + Number(bill.total_amount), 0),
      mfcBills: mfcBills.length,
      todayCollections: dayPayments.reduce((sum, payment) => sum + Number(payment.amount), 0),
      todayCollectionEntries: dayPayments.length,
      todayCommission: dayChalans.reduce((sum, chalan) => sum + Number(chalan.commission_amount), 0),
      todayBills: dayBills.length,
      todayChalans: dayChalans.length,
    };
  },
};
