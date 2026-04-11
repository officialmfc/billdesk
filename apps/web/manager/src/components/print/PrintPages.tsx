"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  ManagerPrintableCustomerDayLedgerSheet,
  ManagerPrintableCustomerDetailSheet,
  ManagerPrintableBillSheet,
  ManagerPrintableLineSheet,
  type ManagerBuyerPurchaseCard,
  type ManagerChalanCard,
} from "@mfc/manager-ui";

import {
  type CustomerBillDetailView,
  type CustomerLedgerPurchaseRow,
  type DayCustomerLedgerSections,
  buildCustomerPurchaseRows,
  buildDayCustomerLedgerSections,
  getCustomerBillDetail,
} from "@/lib/ledger-view-model";
import { useDailyOperationsData } from "@/components/operations/useDailyOperationsData";
import { useLedgerReadModel } from "@/components/ledgers/shared";

import { PrintPageShell } from "./PrintPageShell";

function getParam(
  searchParams: ReturnType<typeof useSearchParams>,
  key: string
): string {
  return searchParams.get(key) || "";
}

function getPrintStatusLabel(status: "due" | "paid" | "partial"): string {
  return status === "partial" ? "Partially paid" : status;
}

export function CustomerBillPrintContent({
  bill,
}: {
  bill: CustomerBillDetailView;
}): React.ReactElement {
  return (
    <ManagerPrintableBillSheet
      billLabel={bill.billNumber}
      customerLabel={bill.businessName || bill.name}
      date={bill.date}
      documentTitle="Customer Bill"
      dueAmount={bill.dueAmount}
      paidAmount={bill.amountPaid}
      rows={bill.lines.map((line) => ({
        amount: line.amount,
        id: line.id,
        label: line.productLabel,
        rate: line.rate,
        serialNo: line.serialNo,
        weight: line.weightKg,
      }))}
      totalAmount={bill.totalAmount}
      totalWeight={bill.totalWeight}
    />
  );
}

export function BuyerPurchasePrintContent({
  card,
  date,
}: {
  card: ManagerBuyerPurchaseCard;
  date: string;
}): React.ReactElement {
  return (
    <ManagerPrintableBillSheet
      billLabel={card.billLabel}
      customerLabel={card.businessName || card.name}
      date={date}
      documentTitle="Buyer Bill"
      dueAmount={card.totalDueTillDate}
      paidAmount={card.datePayment}
      rows={card.items.map((item) => ({
        amount: item.amount,
        id: item.id,
        label: item.label,
        rate: item.pricePerKg,
        serialNo: item.serialNo,
        weight: item.weight,
      }))}
      totalAmount={card.totalPurchase}
      totalWeight={card.totalWeight}
    />
  );
}

export function ChalanPrintContent({
  card,
}: {
  card: ManagerChalanCard;
}): React.ReactElement {
  return (
    <ManagerPrintableLineSheet
      headerTitle={card.sellerName}
      headerMeta={`${card.chalan.chalan_number} • ${new Date(`${card.chalan.chalan_date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`}
      paper="thermal"
      status={{ label: getPrintStatusLabel(card.paymentStatus), tone: card.paymentStatus }}
      rows={card.rows.map((row) => ({
        amount: row.amount,
        id: row.id,
        label: row.label,
        rate: row.pricePerKg,
        serialNo: row.serialNo,
        weight: row.weight,
      }))}
      summaryRows={[
        {
          label: `Commission (${((card.totals.commission / Math.max(card.totals.totalAmount, 1)) * 100).toFixed(1)}%)`,
          tone: "warning",
          value: card.totals.commission,
        },
        ...(card.paymentStatus === "partial"
          ? [
              { label: "Paid so far", tone: "success" as const, value: card.totals.paid },
              { label: "Remaining", tone: "danger" as const, value: card.totals.due },
            ]
          : []),
        { label: "Payable", tone: card.totals.netPayable > 0 ? "default" : "success", value: card.totals.netPayable },
      ]}
      totalAmount={card.totals.totalAmount}
      totalWeight={card.totals.totalWeight}
    />
  );
}

export function CustomerDayLedgerPrintContent({
  date,
  sections,
}: {
  date: string;
  sections: DayCustomerLedgerSections;
}): React.ReactElement {
  return (
    <ManagerPrintableCustomerDayLedgerSheet
      date={date}
      purchasedTodayRows={sections.purchasedToday.map((row) => ({
        id: row.customerId,
        name: row.displayName,
        oldDues: row.olderDues.map((entry) => entry.amount),
        paymentToday: row.paymentToday,
        totalDue: row.outstandingAtClose,
        todayDue: row.todayAmount,
      }))}
      carryForwardRows={sections.dueOnly.map((row) => ({
        id: row.customerId,
        name: row.displayName,
        oldDues: row.olderDues.map((entry) => entry.amount),
        paymentToday: row.paymentToday,
        totalDue: row.outstandingAtClose,
      }))}
    />
  );
}

export function CustomerLedgerDetailPrintContent({
  customerLabel,
  paper = "a4",
  rows,
}: {
  customerLabel: string;
  paper?: "a4" | "thermal";
  rows: CustomerLedgerPurchaseRow[];
}): React.ReactElement {
  return (
    <ManagerPrintableCustomerDetailSheet
      customerLabel={customerLabel}
      paper={paper}
      rows={rows.map((row) => ({
        amount: row.totalAmount,
        date: row.date,
        due: row.dueAmount,
        id: row.id,
        paid: row.paidAmount,
      }))}
    />
  );
}

export function CustomerBillPrintPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const userId = getParam(searchParams, "userId");
  const billId = getParam(searchParams, "billId");
  const { data, loading } = useLedgerReadModel();

  const bill = useMemo(() => getCustomerBillDetail(data, userId, billId), [billId, data, userId]);

  return (
    <PrintPageShell
      backHref={
        userId && billId
          ? `/ledgers/customers/bill?userId=${encodeURIComponent(userId)}&billId=${encodeURIComponent(billId)}`
          : "/ledgers/customers/detail"
      }
      title="Customer Bill Print"
      description="Printable bill sheet."
    >
      {!userId || !billId ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
          Missing bill query parameters.
        </div>
      ) : loading ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
          Loading bill print...
        </div>
      ) : !bill ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
          Bill not found.
        </div>
      ) : (
        <CustomerBillPrintContent bill={bill} />
      )}
    </PrintPageShell>
  );
}

export function BuyerPurchasePrintPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const customerId = getParam(searchParams, "customerId");
  const date = getParam(searchParams, "date");
  const { buyerCards, loading } = useDailyOperationsData(date);

  const card = useMemo(
    () => buyerCards.find((entry) => entry.customerId === customerId),
    [buyerCards, customerId]
  );

  return (
    <PrintPageShell
      backHref={date ? `/operations/buyer-purchases?date=${encodeURIComponent(date)}` : "/operations/buyer-purchases"}
      title="Buyer Purchase Print"
      description="Printable grouped buyer bill sheet."
    >
      {!customerId || !date ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
          Missing buyer purchase query parameters.
        </div>
      ) : loading ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
          Loading buyer purchase print...
        </div>
      ) : !card ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
          Buyer purchase sheet not found.
        </div>
      ) : (
        <BuyerPurchasePrintContent card={card} date={date} />
      )}
    </PrintPageShell>
  );
}

export function ChalanPrintPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const chalanId = getParam(searchParams, "chalanId");
  const date = getParam(searchParams, "date");
  const { loading, verificationCards } = useDailyOperationsData(date);

  const card = useMemo(
    () => verificationCards.find((entry) => entry.chalan.id === chalanId),
    [chalanId, verificationCards]
  );

  return (
    <PrintPageShell
      backHref={date ? `/operations/chalans?date=${encodeURIComponent(date)}` : "/operations/chalans"}
      title="Chalan Print"
      description="Printable seller chalan sheet."
    >
      {!chalanId || !date ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
          Missing chalan query parameters.
        </div>
      ) : loading ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
          Loading chalan print...
        </div>
      ) : !card ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
          Chalan sheet not found.
        </div>
      ) : (
        <ChalanPrintContent card={card} />
      )}
    </PrintPageShell>
  );
}

export function CustomerDayLedgerPrintPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const date = getParam(searchParams, "date");
  const { data, loading } = useLedgerReadModel();
  const sections = useMemo(() => buildDayCustomerLedgerSections(data, date), [data, date]);

  return (
    <PrintPageShell
      backHref={date ? `/ledgers/customers/day?date=${encodeURIComponent(date)}` : "/ledgers/customers/day"}
      title="Customer Day Ledger Print"
      description="Printable customer day ledger sheet."
    >
      {!date ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
          Missing date parameter.
        </div>
      ) : loading ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
          Loading customer day sheet...
        </div>
      ) : (
        <CustomerDayLedgerPrintContent date={date} sections={sections} />
      )}
    </PrintPageShell>
  );
}

export function CustomerLedgerDetailPrintPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const userId = getParam(searchParams, "userId");
  const { data, loading } = useLedgerReadModel();

  const rows = useMemo(() => buildCustomerPurchaseRows(data, userId), [data, userId]);
  const selectedUser = useMemo(() => data.users.find((user) => user.id === userId), [data.users, userId]);
  const customerLabel = selectedUser?.business_name || selectedUser?.name || "Customer Ledger";

  return (
    <PrintPageShell
      backHref={userId ? `/ledgers/customers/detail?userId=${encodeURIComponent(userId)}` : "/ledgers/customers/detail"}
      title="Customer Detail Print"
      description="Printable customer purchase ledger."
    >
      {!userId ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
          Missing userId parameter.
        </div>
      ) : loading ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
          Loading customer detail sheet...
        </div>
      ) : (
        <CustomerLedgerDetailPrintContent customerLabel={customerLabel} rows={rows} />
      )}
    </PrintPageShell>
  );
}
