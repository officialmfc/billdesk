"use client";

import { useSupabaseLoader } from "@/hooks/useSupabaseLoader";
import { isKolkataToday } from "@/lib/kolkata-date";
import { loadWebOperationsReadModel } from "@/lib/web-remote-read-model";
import { useQuery } from "@mfc/data-access";
import type {
  LocalChalan,
  LocalCustomerPayment,
  LocalDailyBill,
  LocalMfcStaff,
  LocalSaleTransaction,
  LocalSellerPayment,
  LocalUser,
} from "@mfc/database";
import {
  buildManagerOperationsSummary,
  type ManagerBuyerPurchaseCard as BuyerPurchaseCard,
  type ManagerChalanCard as ChalanVerificationCard,
  type ManagerDueCollectionCard as DueRow,
  type ManagerOperationsSummary,
} from "@mfc/manager-ui";
import { useCallback, useMemo } from "react";

export type DailyOperationsTotals = {
  totalDueTillDate: number;
  totalDateDue: number;
  totalDatePayments: number;
  totalDayChalanSale: number;
  totalDaySellerPayout: number;
  totalDayBuyers: number;
  totalDayChalans: number;
  totalDayBills: number;
  totalCommission: number;
  totalDayDue: number;
};

export function useDailyOperationsData(
  dateStr: string,
  options?: {
    forceRemoteHistory?: boolean;
  }
) {
  const isToday = isKolkataToday(dateStr);
  const useRemoteHistory = options?.forceRemoteHistory === true;
  const useLocalToday = isToday && !useRemoteHistory;
  const billsQuery = useQuery<LocalDailyBill>("daily_bills", {
    enabled: useLocalToday,
    orderBy: { field: "bill_date", direction: "desc" },
  });
  const customerPaymentsQuery = useQuery<LocalCustomerPayment>("customer_payments", {
    enabled: useLocalToday,
    orderBy: { field: "payment_date", direction: "desc" },
  });
  const chalansQuery = useQuery<LocalChalan>("chalans", {
    enabled: useLocalToday,
    orderBy: { field: "chalan_date", direction: "desc" },
  });
  const sellerPaymentsQuery = useQuery<LocalSellerPayment>("seller_payments", {
    enabled: useLocalToday,
    orderBy: { field: "payment_date", direction: "desc" },
  });
  const saleTransactionsQuery = useQuery<LocalSaleTransaction>("sale_transactions", {
    enabled: useLocalToday,
    orderBy: { field: "updated_at", direction: "desc" },
  });
  const usersQuery = useQuery<LocalUser>("users", { enabled: useLocalToday });
  const staffQuery = useQuery<LocalMfcStaff>("mfc_staff", { enabled: useLocalToday });

  const remoteLoader = useCallback(
    (supabase: Parameters<typeof loadWebOperationsReadModel>[0]) =>
      loadWebOperationsReadModel(supabase, dateStr),
    [dateStr]
  );
  const remoteQuery = useSupabaseLoader(remoteLoader, {
    enabled: !isToday || useRemoteHistory,
    initialData: {
      users: [],
      mfcStaff: [],
      bills: [],
      customerPayments: [],
      chalans: [],
      sellerPayments: [],
      saleTransactions: [],
    },
  });

  const bills = useLocalToday ? billsQuery.data : remoteQuery.data.bills;
  const customerPayments = useLocalToday
    ? customerPaymentsQuery.data
    : remoteQuery.data.customerPayments;
  const chalans = useLocalToday ? chalansQuery.data : remoteQuery.data.chalans;
  const sellerPayments = useLocalToday
    ? sellerPaymentsQuery.data
    : remoteQuery.data.sellerPayments;
  const saleTransactions = useLocalToday
    ? saleTransactionsQuery.data
    : remoteQuery.data.saleTransactions;
  const users = useLocalToday ? usersQuery.data : remoteQuery.data.users;
  const staff = useLocalToday ? staffQuery.data : remoteQuery.data.mfcStaff;

  const loading = useLocalToday
    ? billsQuery.loading ||
      customerPaymentsQuery.loading ||
      chalansQuery.loading ||
      sellerPaymentsQuery.loading ||
      saleTransactionsQuery.loading ||
      usersQuery.loading ||
      staffQuery.loading
    : remoteQuery.loading;

  const billMap = useMemo(
    () => new Map(bills.map((bill) => [bill.id, bill])),
    [bills]
  );

  const dayBills = useMemo(
    () => bills.filter((bill) => bill.bill_date === dateStr),
    [bills, dateStr]
  );

  const dayCustomerPayments = useMemo(
    () => customerPayments.filter((payment) => payment.payment_date === dateStr),
    [customerPayments, dateStr]
  );

  const dayChalans = useMemo(
    () =>
      chalans
        .filter((chalan) => chalan.chalan_date === dateStr)
        .sort((a, b) => a.chalan_number.localeCompare(b.chalan_number)),
    [chalans, dateStr]
  );

  const daySellerPayments = useMemo(
    () => sellerPayments.filter((payment) => payment.payment_date === dateStr),
    [sellerPayments, dateStr]
  );

  const dayBillIds = useMemo(
    () => new Set(dayBills.map((bill) => bill.id)),
    [dayBills]
  );

  const dayTransactions = useMemo(
    () =>
      saleTransactions.filter((transaction) => dayBillIds.has(transaction.daily_bill_id)),
    [dayBillIds, saleTransactions]
  );

  const sharedSummary = useMemo<ManagerOperationsSummary>(
    () =>
      buildManagerOperationsSummary(dateStr, {
        bills,
        chalans,
        customerPayments,
        saleTransactions,
        sellerPayments,
        staff,
        users,
      }),
    [bills, chalans, customerPayments, dateStr, saleTransactions, sellerPayments, staff, users]
  );

  const dueRows = useMemo(
    () => [...sharedSummary.dueRegister.selectedDateCards, ...sharedSummary.dueRegister.carryForwardCards],
    [sharedSummary.dueRegister]
  );

  const buyerCards = sharedSummary.buyerCards;
  const verificationCards = sharedSummary.verificationCards.map((card) => ({
    ...card,
    chalan: card.chalan as LocalChalan,
  }));

  const totals = useMemo<DailyOperationsTotals>(() => {
    const totalDueTillDate = dueRows.reduce((sum, row) => sum + row.totalDueTillDate, 0);
    const totalDateDue = dueRows.reduce((sum, row) => sum + row.selectedDateDue, 0);
    const totalDatePayments = dueRows.reduce((sum, row) => sum + row.selectedDatePayment, 0);
    const totalDayChalanSale = dayChalans.reduce(
      (sum, chalan) => sum + Number(chalan.total_sale_value),
      0
    );
    const totalDaySellerPayout = daySellerPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
    const totalCommission = sharedSummary.chalans.reduce(
      (sum, chalan) => sum + chalan.totals.commission,
      0
    );
    const totalDayDue = sharedSummary.chalans.reduce((sum, chalan) => sum + chalan.dueAmount, 0);

    return {
      totalDueTillDate,
      totalDateDue,
      totalDatePayments,
      totalDayChalanSale,
      totalDaySellerPayout,
      totalDayBuyers: buyerCards.length,
      totalDayChalans: dayChalans.length,
      totalDayBills: dayBills.length,
      totalCommission,
      totalDayDue,
    };
  }, [buyerCards.length, dayBills.length, dayChalans, daySellerPayments, dueRows, sharedSummary.chalans]);

  const refetchAll = useCallback(async () => {
    if (useLocalToday) {
      await Promise.all([
        billsQuery.refetch(),
        customerPaymentsQuery.refetch(),
        chalansQuery.refetch(),
        sellerPaymentsQuery.refetch(),
        saleTransactionsQuery.refetch(),
        usersQuery.refetch(),
        staffQuery.refetch(),
      ]);
      return;
    }

    await remoteQuery.refetch();
  }, [
    useLocalToday,
    billsQuery,
    chalansQuery,
    customerPaymentsQuery,
    remoteQuery,
    saleTransactionsQuery,
    sellerPaymentsQuery,
    staffQuery,
    usersQuery,
  ]);

  return {
    billMap,
    bills,
    buyerCards,
    customerPayments,
    dayBills,
    dayChalans,
    dayCustomerPayments,
    daySellerPayments,
    dayTransactions,
    dueRegister: sharedSummary.dueRegister,
    dueRows,
    loading,
    refetchAll,
    saleTransactions,
    totals,
    users,
    verificationCards,
  };
}
