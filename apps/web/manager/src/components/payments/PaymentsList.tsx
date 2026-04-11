"use client";

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseLoader } from "@/hooks/useSupabaseLoader";
import { loadWebPaymentsReadModel } from "@/lib/web-remote-read-model";
import { Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type {
  LocalChalan,
  LocalCustomerBalance,
  LocalCustomerPayment,
  LocalDailyBill,
  LocalManagerSpending,
  LocalMfcStaff,
  LocalSellerBalance,
  LocalSellerPayment,
  LocalUser,
} from "@mfc/database";
import {
  buildManagerPaymentsOverview,
  ManagerDesktopPaymentAccountCard,
} from "@mfc/manager-ui";
import { buildManagerSpendingsOverview } from "@mfc/manager-workflows";

import { CreateCustomerPaymentDialog } from "./CreateCustomerPaymentDialog";
import { CreateManagerSpendingDialog } from "./CreateManagerSpendingDialog";
import { CreateSellerPaymentDialog } from "./CreateSellerPaymentDialog";

type PaymentTab = "customer" | "seller" | "spendings";

function getTodayDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTag(value: string): string {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function PaymentsList({
  initialTab = "customer",
}: {
  initialTab?: PaymentTab;
} = {}): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<PaymentTab>(initialTab);
  const [spendingDate, setSpendingDate] = useState(getTodayDateString());

  const paymentsLoader = useCallback(
    (supabase: Parameters<typeof loadWebPaymentsReadModel>[0]) =>
      loadWebPaymentsReadModel(supabase),
    []
  );

  const { data, loading, refetch } = useSupabaseLoader(paymentsLoader, {
    initialData: {
      users: [] as LocalUser[],
      mfcStaff: [] as LocalMfcStaff[],
      customerBalances: [] as LocalCustomerBalance[],
      sellerBalances: [] as LocalSellerBalance[],
      bills: [] as LocalDailyBill[],
      chalans: [] as LocalChalan[],
      customerPayments: [] as LocalCustomerPayment[],
      sellerPayments: [] as LocalSellerPayment[],
      managerSpendings: [] as LocalManagerSpending[],
    },
  });

  const overview = useMemo(
    () =>
      buildManagerPaymentsOverview(searchQuery, {
        bills: data.bills,
        chalans: data.chalans,
        customerBalances: data.customerBalances,
        customerPayments: data.customerPayments,
        sellerBalances: data.sellerBalances,
        sellerPayments: data.sellerPayments,
        users: data.users,
      }),
    [data, searchQuery]
  );

  const spendingsOverview = useMemo(
    () =>
      buildManagerSpendingsOverview(
        {
          spendings: data.managerSpendings,
          staff: data.mfcStaff.map((staff) => ({
            id: staff.id,
            full_name: staff.full_name,
            is_active: staff.is_active,
            role: staff.role,
          })),
        },
        {
          date: spendingDate || undefined,
          search: searchQuery,
        }
      ),
    [data.managerSpendings, data.mfcStaff, searchQuery, spendingDate]
  );

  const activeAccounts =
    activeTab === "customer" ? overview.customerAccounts : overview.sellerAccounts;
  const activeHistory =
    activeTab === "customer" ? overview.customerHistory : overview.sellerHistory;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as PaymentTab)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3 sm:w-[420px]">
            <TabsTrigger value="customer">Customer payment</TabsTrigger>
            <TabsTrigger value="seller">Seller payout</TabsTrigger>
            <TabsTrigger value="spendings">Spendings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-3 lg:max-w-3xl lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                activeTab === "customer"
                  ? "Search accounts, business, or bill"
                  : activeTab === "seller"
                    ? "Search sellers, business, or chalan"
                    : "Search title, category, note, or manager"
              }
              className="pl-9"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          {activeTab === "spendings" ? (
            <Input
              type="date"
              value={spendingDate}
              onChange={(event) => setSpendingDate(event.target.value)}
              className="w-full lg:w-[180px]"
            />
          ) : null}
        </div>

        {activeTab === "customer" ? (
          <CreateCustomerPaymentDialog onSuccess={refetch} triggerLabel="Add payment" />
        ) : activeTab === "seller" ? (
          <CreateSellerPaymentDialog onSuccess={refetch} triggerLabel="Add payout" />
        ) : (
          <CreateManagerSpendingDialog
            onSuccess={refetch}
            presetDate={spendingDate}
            triggerLabel="Add spend"
          />
        )}
      </div>

      {activeTab === "spendings" ? (
        <>
          <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="rounded-[24px] border border-border/70 bg-card px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Total spend
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(spendingsOverview.totalAmount)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {spendingDate ? `For ${spendingDate}` : "All dates"}
              </p>
            </div>

            <div className="rounded-[24px] border border-border/70 bg-card px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Category totals
              </p>
              {spendingsOverview.categoryTotals.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {spendingsOverview.categoryTotals.map((entry) => (
                    <div
                      key={entry.category}
                      className="rounded-full border border-border/70 bg-muted/40 px-3 py-2 text-xs"
                    >
                      <span className="font-semibold text-foreground">
                        {formatTag(entry.category)}
                      </span>
                      <span className="ml-2 text-muted-foreground">
                        {formatCurrency(entry.totalAmount)} • {entry.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No spendings matched this filter.
                </p>
              )}
            </div>
          </div>

          {spendingsOverview.rows.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border/70 bg-card/60 px-6 py-16 text-center text-sm text-muted-foreground">
              No spendings matched this filter.
            </div>
          ) : (
            <div className="grid gap-3">
              {spendingsOverview.rows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-[22px] border border-border/70 bg-card px-5 py-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-semibold tracking-tight text-foreground">
                        {row.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {row.spentDate} • {formatTag(row.category)} •{" "}
                        {formatTag(row.paymentMethod)}
                        {row.createdByName ? ` • ${row.createdByName}` : ""}
                      </p>
                      {row.note ? (
                        <p className="mt-2 text-sm text-muted-foreground">{row.note}</p>
                      ) : null}
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {formatCurrency(row.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-3 lg:grid-cols-2">
            {loading ? (
              <>
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className="h-48 animate-pulse rounded-[24px] border border-border/70 bg-card/60"
                  />
                ))}
              </>
            ) : activeAccounts.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border/70 bg-card/60 px-6 py-16 text-center text-sm text-muted-foreground lg:col-span-2">
                No due accounts matched this search.
              </div>
            ) : (
              activeAccounts.map((account) => (
                <ManagerDesktopPaymentAccountCard
                  key={account.userId}
                  card={account}
                  action={
                    activeTab === "customer" ? (
                      <CreateCustomerPaymentDialog
                        onSuccess={refetch}
                        presetCustomerId={account.userId}
                        presetCustomerName={account.businessName || account.name}
                        triggerLabel="Add payment"
                        triggerSize="sm"
                        triggerVariant="outline"
                      />
                    ) : (
                      <CreateSellerPaymentDialog
                        onSuccess={refetch}
                        presetSellerId={account.userId}
                        presetSellerName={account.businessName || account.name}
                        triggerLabel="Add payout"
                        triggerSize="sm"
                        triggerVariant="outline"
                      />
                    )
                  }
                />
              ))
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold tracking-tight">
              {activeTab === "customer" ? "Recent customer payments" : "Recent seller payouts"}
            </h2>
            {activeHistory.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border/70 bg-card/60 px-6 py-12 text-center text-sm text-muted-foreground">
                No recent payment history matched this search.
              </div>
            ) : (
              <div className="grid gap-3">
                {activeHistory.slice(0, 12).map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-[20px] border border-border/70 bg-card px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {entry.businessName || entry.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {entry.reference} • {entry.date} • {entry.method.replaceAll("_", " ")}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(entry.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
