import type { ReactElement, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  BookCopy,
  FileClock,
  FileSpreadsheet,
  History,
  ReceiptText,
  Users,
} from "lucide-react";
import { ManagerDateNavigator } from "@mfc/manager-ui";

import type {
  DesktopCustomerBillPage as DesktopCustomerBillPageData,
  DesktopCustomerDayLedgerSections,
  DesktopCustomerLedgerDetailPage as DesktopCustomerLedgerDetailPageData,
  DesktopCustomerLedgerHistoryPage as DesktopCustomerLedgerHistoryPageData,
  DesktopLedgerSearchUser,
  DesktopSellerDayLedgerRow,
  DesktopSellerLedgerHistoryPage as DesktopSellerLedgerHistoryPageData,
  SelectionOption,
} from "../../shared/contracts";
import {
  DesktopCustomerBillPrintContent,
  DesktopCustomerDayPrintContent,
  DesktopCustomerDetailPrintContent,
  DesktopPrintButton,
} from "./desktop-print";
import { DesktopCustomerPaymentDialog } from "./payment-entry-dialogs";

type DesktopMessage = { tone: "error" | "success" | "warning"; text: string } | null;

type LedgerViewTarget =
  | "ledgers-overview"
  | "ledgers-customers-day"
  | "ledgers-customers-detail"
  | "ledgers-customers-history"
  | "ledgers-customers-bill"
  | "ledgers-sellers-day"
  | "ledgers-sellers-history";

function getCurrentDateIST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function shiftDate(dateStr: string, amount: number): string {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatDateLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildAccountOption(label: string, value: string, totalDue: number): SelectionOption {
  return {
    label,
    meta: String(totalDue),
    value,
  };
}

function getDisplayName(user?: {
  businessName?: string | null;
  business_name?: string | null;
  name?: string | null;
}): string {
  return user?.businessName || user?.business_name || user?.name || "Unknown";
}

function filterLedgerUsers(users: DesktopLedgerSearchUser[], query: string): DesktopLedgerSearchUser[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return users.slice(0, 8);
  }

  return users
    .filter((user) =>
      [user.business_name, user.name, user.phone]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized))
    )
    .slice(0, 12);
}

function PageIntro({
  action,
  subtitle,
  title,
}: {
  action?: ReactNode;
  subtitle: string;
  title: string;
}): ReactElement {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {action ? <div className="header-actions">{action}</div> : null}
    </div>
  );
}

function DesktopDateToolbar({
  dateStr,
  onChange,
}: {
  dateStr: string;
  onChange: (nextDate: string) => void;
}): ReactElement {
  return (
    <ManagerDateNavigator
      dateValue={dateStr}
      onChange={onChange}
      onNext={() => onChange(shiftDate(dateStr, 1))}
      onPrevious={() => onChange(shiftDate(dateStr, -1))}
      onToday={() => onChange(getCurrentDateIST())}
    />
  );
}

function useAsyncData<T>(loader: () => Promise<T>, deps: readonly unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void loader()
      .then((next) => {
        if (!cancelled) {
          setData(next);
        }
      })
      .catch((reason) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Could not load ledger data.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, error, loading };
}

function LedgerSearchCard({
  description,
  emptyMessage,
  onSelect,
  placeholder,
  title,
  users,
}: {
  description: string;
  emptyMessage: string;
  onSelect: (userId: string) => void;
  placeholder: string;
  title: string;
  users: DesktopLedgerSearchUser[];
}): ReactElement {
  const [query, setQuery] = useState("");
  const results = useMemo(() => filterLedgerUsers(users, query), [query, users]);

  return (
    <div className="content-card ledger-search-card">
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <div className="card-title" style={{ fontSize: "1.2rem" }}>
            {title}
          </div>
          <p className="page-subtitle">{description}</p>
        </div>
      </div>

      <div className="field-block">
        <input
          className="text-input"
          placeholder={placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {results.length ? (
        <div className="ledger-search-results">
          {results.map((user) => (
            <button
              key={user.id}
              className="ledger-search-result"
              onClick={() => onSelect(user.id)}
              type="button"
            >
              <div className="ledger-search-copy">
                <div className="ledger-search-title">{getDisplayName(user)}</div>
                <div className="ledger-search-meta">
                  {user.business_name ? user.name : user.phone || "No phone"}
                </div>
              </div>
              <span className="secondary-button" style={{ padding: "10px 14px" }}>
                View
              </span>
            </button>
          ))}
        </div>
      ) : query.trim() ? (
        <div className="ledger-empty-copy">{emptyMessage}</div>
      ) : null}
    </div>
  );
}

function LedgerEmptyCard({ text }: { text: string }): ReactElement {
  return <div className="content-card ledger-empty-copy">{text}</div>;
}

function renderOldDueCell(amounts: number[]): ReactElement {
  if (amounts.length === 0) {
    return <span className="muted-text">-</span>;
  }

  return (
    <div className="ledger-chip-list">
      {amounts.map((amount, index) => (
        <span key={`${amount}-${index}`} className="ledger-chip">
          {formatCurrency(amount)}
        </span>
      ))}
    </div>
  );
}

function LedgerTable({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <div className="ledger-table-wrap">
      <table className="ledger-table">{children}</table>
    </div>
  );
}

function LedgerDeskCard({
  description,
  icon: Icon,
  onClick,
  title,
}: {
  description: string;
  icon: typeof BookCopy;
  onClick: () => void;
  title: string;
}): ReactElement {
  return (
    <button className="tile" onClick={onClick} type="button">
      <div className="tile-icon">
        <Icon size={20} />
      </div>
      <div className="tile-title">{title}</div>
      <div className="tile-copy">{description}</div>
    </button>
  );
}

export function DesktopLedgersOverviewPage({
  onNavigate,
}: {
  onNavigate: (target: LedgerViewTarget) => void;
}): ReactElement {
  const customerCards = [
    {
      description: "Selected-date customer sheet with due, payment, add payment, and view.",
      icon: FileSpreadsheet,
      target: "ledgers-customers-day" as const,
      title: "Customer Day",
    },
    {
      description: "Purchase ledger with amount, paid, due, and bill detail access.",
      icon: ReceiptText,
      target: "ledgers-customers-detail" as const,
      title: "Customer Detail",
    },
    {
      description: "Date-wise billed and payment history for one customer.",
      icon: History,
      target: "ledgers-customers-history" as const,
      title: "Customer History",
    },
  ];

  const sellerCards = [
    {
      description: "Selected-date seller sheet with chalan reference, amount, and view.",
      icon: Users,
      target: "ledgers-sellers-day" as const,
      title: "Seller Day",
    },
    {
      description: "Date-wise net payable and payout history for one seller.",
      icon: FileClock,
      target: "ledgers-sellers-history" as const,
      title: "Seller History",
    },
  ];

  return (
    <div className="page-panel">
      <PageIntro title="Ledger Desk" subtitle="Customer and seller ledger sheets aligned with web." />

      <div className="section-heading">
        <div>
          <h2>Customers</h2>
          <p>Start with day sheet, then move into detail or history.</p>
        </div>
      </div>
      <div className="sales-grid">
        {customerCards.map((card) => (
          <LedgerDeskCard
            key={card.target}
            description={card.description}
            icon={card.icon}
            onClick={() => onNavigate(card.target)}
            title={card.title}
          />
        ))}
      </div>

      <div className="section-heading">
        <div>
          <h2>Sellers</h2>
          <p>Use day sheet for selected-date chalans and history for payouts.</p>
        </div>
      </div>
      <div className="sales-grid">
        {sellerCards.map((card) => (
          <LedgerDeskCard
            key={card.target}
            description={card.description}
            icon={card.icon}
            onClick={() => onNavigate(card.target)}
            title={card.title}
          />
        ))}
      </div>
    </div>
  );
}

export function DesktopCustomerDayLedgerPage({
  onMessage,
  onOpenDetail,
}: {
  onMessage: (message: DesktopMessage) => void;
  onOpenDetail: (userId: string) => void;
}): ReactElement {
  const [dateStr, setDateStr] = useState(getCurrentDateIST());
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, error, loading } = useAsyncData<DesktopCustomerDayLedgerSections>(
    () => window.managerDesktopApi.ledgers.getCustomerDay(dateStr),
    [dateStr, refreshKey]
  );

  const accountOptions = useMemo(() => {
    const seen = new Set<string>();
    return [...(data?.purchasedToday ?? []), ...(data?.dueOnly ?? [])]
      .filter((row) => {
        if (seen.has(row.customerId)) {
          return false;
        }
        seen.add(row.customerId);
        return true;
      })
      .map((row) => buildAccountOption(row.displayName, row.customerId, row.outstandingAtClose));
  }, [data?.dueOnly, data?.purchasedToday]);

  return (
    <div className="page-panel">
      <PageIntro
        title="Customer Ledger"
        subtitle="Purchased today and due-only customer sheet."
        action={
          !loading && data ? (
            <DesktopPrintButton
              documentTitle="Ledger Sheet"
              headerMode="compact"
              paper="a4"
              trigger={<button className="secondary-button" type="button">Print sheet</button>}
            >
              <DesktopCustomerDayPrintContent date={dateStr} sections={data} />
            </DesktopPrintButton>
          ) : undefined
        }
      />
      <DesktopDateToolbar dateStr={dateStr} onChange={setDateStr} />
      {error ? <div className="banner error">{error}</div> : null}

      <div className="section-heading">
        <div>
          <h2>Purchased Today</h2>
          <p>Customers with purchases on the selected date.</p>
        </div>
      </div>
      {loading ? (
        <LedgerEmptyCard text="Loading customer day ledger..." />
      ) : (
        <LedgerTable>
          <thead>
            <tr>
              <th>Name</th>
              <th className="align-right">Old</th>
              <th className="align-right">Today</th>
              <th className="align-right">Total (due)</th>
              <th className="align-right">Payment (today)</th>
              <th className="align-center ledger-col-action">+</th>
              <th className="align-right ledger-col-action">View</th>
            </tr>
          </thead>
          <tbody>
            {data?.purchasedToday.length ? (
              data.purchasedToday.map((row) => (
                <tr key={row.customerId}>
                  <td className="cell-strong">{row.displayName}</td>
                  <td className="align-right">{renderOldDueCell(row.olderDues.map((entry) => entry.amount))}</td>
                  <td className="align-right">{row.todayAmount > 0 ? formatCurrency(row.todayAmount) : "-"}</td>
                  <td className="align-right ledger-danger-text">
                    {row.outstandingAtClose > 0 ? formatCurrency(row.outstandingAtClose) : "-"}
                  </td>
                  <td className="align-right ledger-success-text">
                    {row.paymentToday > 0 ? formatCurrency(row.paymentToday) : "-"}
                  </td>
                  <td className="align-center">
                    {row.outstandingAtClose > 0 ? (
                      <DesktopCustomerPaymentDialog
                        accountOptions={accountOptions}
                        onMessage={onMessage}
                        onSuccess={async () => setRefreshKey((current) => current + 1)}
                        presetCustomerId={row.customerId}
                        presetCustomerName={row.displayName}
                        presetPaymentDate={dateStr}
                        triggerLabel="+"
                      />
                    ) : (
                      <span className="muted-text">-</span>
                    )}
                  </td>
                  <td className="align-right">
                    <button
                      className="secondary-button"
                      style={{ padding: "10px 14px" }}
                      onClick={() => onOpenDetail(row.customerId)}
                      type="button"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="ledger-empty-row" colSpan={7}>
                  No customer purchases for this date.
                </td>
              </tr>
            )}
          </tbody>
        </LedgerTable>
      )}

      <div className="section-heading">
        <div>
          <h2>Due, No Purchase Today</h2>
          <p>Customers with older due but no purchase on the selected date.</p>
        </div>
      </div>
      {loading ? (
        <LedgerEmptyCard text="Loading customer day ledger..." />
      ) : (
        <LedgerTable>
          <thead>
            <tr>
              <th>Name</th>
              <th className="align-right">Old</th>
              <th className="align-right">Total (due)</th>
              <th className="align-right">Payment (today)</th>
              <th className="align-center ledger-col-action">+</th>
              <th className="align-right ledger-col-action">View</th>
            </tr>
          </thead>
          <tbody>
            {data?.dueOnly.length ? (
              data.dueOnly.map((row) => (
                <tr key={row.customerId}>
                  <td className="cell-strong">{row.displayName}</td>
                  <td className="align-right">{renderOldDueCell(row.olderDues.map((entry) => entry.amount))}</td>
                  <td className="align-right ledger-danger-text">
                    {row.outstandingAtClose > 0 ? formatCurrency(row.outstandingAtClose) : "-"}
                  </td>
                  <td className="align-right ledger-success-text">
                    {row.paymentToday > 0 ? formatCurrency(row.paymentToday) : "-"}
                  </td>
                  <td className="align-center">
                    {row.outstandingAtClose > 0 ? (
                      <DesktopCustomerPaymentDialog
                        accountOptions={accountOptions}
                        onMessage={onMessage}
                        onSuccess={async () => setRefreshKey((current) => current + 1)}
                        presetCustomerId={row.customerId}
                        presetCustomerName={row.displayName}
                        presetPaymentDate={dateStr}
                        triggerLabel="+"
                      />
                    ) : (
                      <span className="muted-text">-</span>
                    )}
                  </td>
                  <td className="align-right">
                    <button
                      className="secondary-button"
                      style={{ padding: "10px 14px" }}
                      onClick={() => onOpenDetail(row.customerId)}
                      type="button"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="ledger-empty-row" colSpan={6}>
                  No carry-forward customer due for this date.
                </td>
              </tr>
            )}
          </tbody>
        </LedgerTable>
      )}
    </div>
  );
}

export function DesktopCustomerLedgerDetailPage({
  onOpenBill,
  onOpenHistory,
  onSelectUser,
  userId,
}: {
  onOpenBill: (userId: string, billId: string) => void;
  onOpenHistory: (userId: string) => void;
  onSelectUser: (userId: string) => void;
  userId: string | null;
}): ReactElement {
  const { data, error, loading } = useAsyncData<DesktopCustomerLedgerDetailPageData>(
    () => window.managerDesktopApi.ledgers.getCustomerDetail(userId ?? ""),
    [userId]
  );

  const selectedLabel = getDisplayName(
    data?.summary
      ? { businessName: data.summary.businessName, name: data.summary.name }
      : data?.searchUsers.find((user) => user.id === userId)
  );

  return (
    <div className="page-panel">
      <PageIntro
        title={userId ? selectedLabel : "Customer Detail"}
        subtitle="Day-wise amount, paid, due, and bill detail."
        action={
          userId ? (
            <div className="header-actions">
              <DesktopPrintButton
                documentTitle="Customer Ledger"
                paper="thermal"
                trigger={<button className="secondary-button" type="button">Print sheet</button>}
              >
                <DesktopCustomerDetailPrintContent customerLabel={selectedLabel} rows={data?.purchaseRows ?? []} />
              </DesktopPrintButton>
              <button
                className="secondary-button"
                onClick={() => onOpenHistory(userId)}
                type="button"
              >
                History
              </button>
            </div>
          ) : undefined
        }
      />
      {error ? <div className="banner error">{error}</div> : null}

      {!userId ? (
        <LedgerSearchCard
          title="Find customer ledger"
          description="Search a customer to open day-wise bill detail."
          placeholder="Search customer..."
          users={data?.searchUsers ?? []}
          emptyMessage="No customer ledgers matched."
          onSelect={onSelectUser}
        />
      ) : loading ? (
        <LedgerEmptyCard text="Loading customer detail..." />
      ) : !data?.summary && !(data?.purchaseRows.length ?? 0) ? (
        <LedgerSearchCard
          title="Customer not found"
          description="Search again to open the detail ledger."
          placeholder="Search customer..."
          users={data?.searchUsers ?? []}
          emptyMessage="The selected customer could not be loaded."
          onSelect={onSelectUser}
        />
      ) : (
        <>
          <div className="content-card ledger-summary-card">
            <div>
              <div className="tile-eyebrow">Current due</div>
              <div className="card-title" style={{ fontSize: "1.15rem", marginTop: 6 }}>
                {selectedLabel}
              </div>
            </div>
            <div className="ledger-summary-amount ledger-danger-text">
              {formatCurrency(data?.summary?.currentDue ?? 0)}
            </div>
          </div>

          <LedgerTable>
            <thead>
              <tr>
                <th>Date</th>
                <th className="align-right">Amount</th>
                <th className="align-right">Paid</th>
                <th className="align-right">Due</th>
                <th className="align-right ledger-col-action">Detail</th>
              </tr>
            </thead>
            <tbody>
              {data?.purchaseRows.length ? (
                data.purchaseRows.map((row) => (
                  <tr key={row.id}>
                    <td className="cell-strong">{formatDateLabel(row.date)}</td>
                    <td className="align-right">{formatCurrency(row.totalAmount)}</td>
                    <td className="align-right ledger-success-text">{formatCurrency(row.paidAmount)}</td>
                    <td className="align-right ledger-danger-text">{formatCurrency(row.dueAmount)}</td>
                    <td className="align-right">
                      <button
                        className="secondary-button"
                        style={{ padding: "10px 14px" }}
                        onClick={() => onOpenBill(userId, row.id)}
                        type="button"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="ledger-empty-row" colSpan={5}>
                    No purchase history for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </LedgerTable>
        </>
      )}
    </div>
  );
}

export function DesktopCustomerLedgerHistoryPage({
  onOpenDetail,
  onSelectUser,
  userId,
}: {
  onOpenDetail: (userId: string) => void;
  onSelectUser: (userId: string) => void;
  userId: string | null;
}): ReactElement {
  const { data, error, loading } = useAsyncData<DesktopCustomerLedgerHistoryPageData>(
    () => window.managerDesktopApi.ledgers.getCustomerHistory(userId ?? ""),
    [userId]
  );

  const selectedLabel = getDisplayName(
    data?.summary
      ? { businessName: data.summary.businessName, name: data.summary.name }
      : data?.searchUsers.find((user) => user.id === userId)
  );

  return (
    <div className="page-panel">
      <PageIntro
        title={userId ? selectedLabel : "Customer History"}
        subtitle="Date-wise billed and payment totals."
        action={
          userId ? (
            <button
              className="secondary-button"
              onClick={() => onOpenDetail(userId)}
              type="button"
            >
              Detail
            </button>
          ) : undefined
        }
      />
      {error ? <div className="banner error">{error}</div> : null}

      {!userId ? (
        <LedgerSearchCard
          title="Find customer ledger"
          description="Search a customer to open bill and payment history."
          placeholder="Search customer..."
          users={data?.searchUsers ?? []}
          emptyMessage="No customer ledgers matched."
          onSelect={onSelectUser}
        />
      ) : loading ? (
        <LedgerEmptyCard text="Loading customer history..." />
      ) : !data?.summary && !(data?.historyRows.length ?? 0) ? (
        <LedgerSearchCard
          title="Customer not found"
          description="Search again to open customer history."
          placeholder="Search customer..."
          users={data?.searchUsers ?? []}
          emptyMessage="The selected customer could not be loaded."
          onSelect={onSelectUser}
        />
      ) : (
        <LedgerTable>
          <thead>
            <tr>
              <th>Date</th>
              <th className="align-right">Bill</th>
              <th className="align-right">Payment</th>
            </tr>
          </thead>
          <tbody>
            {data?.historyRows.length ? (
              data.historyRows.map((row) => (
                <tr key={row.date}>
                  <td className="cell-strong">{formatDateLabel(row.date)}</td>
                  <td className="align-right">{formatCurrency(row.billed)}</td>
                  <td className="align-right ledger-success-text">{formatCurrency(row.payment)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="ledger-empty-row" colSpan={3}>
                  No customer ledger history.
                </td>
              </tr>
            )}
          </tbody>
        </LedgerTable>
      )}
    </div>
  );
}

export function DesktopCustomerBillPage({
  billId,
  onBackToDetail,
  onSelectUser,
  userId,
}: {
  billId: string | null;
  onBackToDetail: (userId: string) => void;
  onSelectUser: (userId: string) => void;
  userId: string | null;
}): ReactElement {
  const { data, error, loading } = useAsyncData<DesktopCustomerBillPageData>(
    () => window.managerDesktopApi.ledgers.getCustomerBill(userId ?? "", billId ?? ""),
    [billId, userId]
  );

  const bill = data?.bill ?? null;
  const selectedLabel = getDisplayName(
    bill
      ? { businessName: bill.businessName, name: bill.name }
      : data?.summary
        ? { businessName: data.summary.businessName, name: data.summary.name }
        : data?.searchUsers.find((user) => user.id === userId)
  );

  return (
    <div className="page-panel">
      <PageIntro
        title={userId ? selectedLabel : "Customer Bill"}
        subtitle="Bill lines, paid amount, and due."
        action={
          userId ? (
            <div className="header-actions">
              {bill ? (
                <DesktopPrintButton
                  documentTitle="Customer Bill"
                  paper="thermal"
                  trigger={<button className="secondary-button" type="button">Print bill</button>}
                >
                  <DesktopCustomerBillPrintContent bill={bill} />
                </DesktopPrintButton>
              ) : null}
              <button
                className="secondary-button"
                onClick={() => onBackToDetail(userId)}
                type="button"
              >
                Back to detail
              </button>
            </div>
          ) : undefined
        }
      />
      {error ? <div className="banner error">{error}</div> : null}

      {!userId ? (
        <LedgerSearchCard
          title="Find customer"
          description="Search a customer ledger first, then open a bill from detail."
          placeholder="Search customer..."
          users={data?.searchUsers ?? []}
          emptyMessage="No customer ledgers matched."
          onSelect={onSelectUser}
        />
      ) : loading ? (
        <LedgerEmptyCard text="Loading customer bill..." />
      ) : !billId || !bill ? (
        <LedgerEmptyCard text="Open a bill from Customer Detail to continue." />
      ) : (
        <>
          <div className="content-card ledger-summary-card">
            <div>
              <div className="card-title" style={{ fontSize: "1.15rem" }}>{bill.billNumber}</div>
              <div className="status-meta" style={{ marginTop: 6 }}>{formatDateLabel(bill.date)}</div>
            </div>
          </div>

          <LedgerTable>
            <thead>
              <tr>
                <th className="ledger-col-sl">SL</th>
                <th>Product</th>
                <th className="align-right">Weight</th>
                <th className="align-right">Rate</th>
                <th className="align-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.lines.map((line) => (
                <tr key={line.id}>
                  <td className="cell-strong">{line.serialNo}</td>
                  <td>{line.productLabel}</td>
                  <td className="align-right">{line.weightKg.toFixed(2)} kg</td>
                  <td className="align-right">{formatCurrency(line.rate)}</td>
                  <td className="align-right cell-strong">{formatCurrency(line.amount)}</td>
                </tr>
              ))}
              <tr>
                <td />
                <td />
                <td className="align-right cell-strong">{bill.totalWeight.toFixed(2)} kg</td>
                <td />
                <td className="align-right cell-strong">{formatCurrency(bill.totalAmount)}</td>
              </tr>
            </tbody>
          </LedgerTable>

          <div className="content-card ledger-summary-list">
            <div className="summary-row">
              <span>Bill amount</span>
              <strong>{formatCurrency(bill.totalAmount)}</strong>
            </div>
            <div className="summary-row">
              <span>Paid</span>
              <strong className="success-text">{formatCurrency(bill.amountPaid)}</strong>
            </div>
            <div className="summary-row">
              <span>Due</span>
              <strong className="danger-text">{formatCurrency(bill.dueAmount)}</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function DesktopSellerDayLedgerPage({
  onOpenHistory,
}: {
  onOpenHistory: (userId: string) => void;
}): ReactElement {
  const [dateStr, setDateStr] = useState(getCurrentDateIST());
  const { data, error, loading } = useAsyncData<DesktopSellerDayLedgerRow[]>(
    () => window.managerDesktopApi.ledgers.getSellerDay(dateStr),
    [dateStr]
  );

  return (
    <div className="page-panel">
      <PageIntro title="Seller Ledger" subtitle="Selected-date seller chalan register." />
      <DesktopDateToolbar dateStr={dateStr} onChange={setDateStr} />
      {error ? <div className="banner error">{error}</div> : null}

      {loading ? (
        <LedgerEmptyCard text="Loading seller day ledger..." />
      ) : (
        <LedgerTable>
          <thead>
            <tr>
              <th>Name</th>
              <th>Chalan</th>
              <th className="align-right">Amount</th>
              <th className="align-right ledger-col-action">View</th>
            </tr>
          </thead>
          <tbody>
            {data?.length ? (
              data.map((row) => (
                <tr key={row.sellerId}>
                  <td className="cell-strong">{row.name}</td>
                  <td>{row.todayReference}</td>
                  <td className="align-right">{formatCurrency(row.todayAmount)}</td>
                  <td className="align-right">
                    <button
                      className="secondary-button"
                      style={{ padding: "10px 14px" }}
                      onClick={() => onOpenHistory(row.sellerId)}
                      type="button"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="ledger-empty-row" colSpan={4}>
                  No seller chalans for this date.
                </td>
              </tr>
            )}
          </tbody>
        </LedgerTable>
      )}
    </div>
  );
}

export function DesktopSellerLedgerHistoryPage({
  onSelectUser,
  userId,
}: {
  onSelectUser: (userId: string) => void;
  userId: string | null;
}): ReactElement {
  const { data, error, loading } = useAsyncData<DesktopSellerLedgerHistoryPageData>(
    () => window.managerDesktopApi.ledgers.getSellerHistory(userId ?? ""),
    [userId]
  );

  const selectedLabel = getDisplayName(
    data?.summary
      ? { businessName: data.summary.businessName, name: data.summary.name }
      : data?.searchUsers.find((user) => user.id === userId)
  );

  return (
    <div className="page-panel">
      <PageIntro
        title={userId ? selectedLabel : "Seller History"}
        subtitle="Date-wise net payable and paid."
      />
      {error ? <div className="banner error">{error}</div> : null}

      {!userId ? (
        <LedgerSearchCard
          title="Find seller ledger"
          description="Search a seller to open payout history."
          placeholder="Search seller..."
          users={data?.searchUsers ?? []}
          emptyMessage="No seller ledgers matched."
          onSelect={onSelectUser}
        />
      ) : loading ? (
        <LedgerEmptyCard text="Loading seller history..." />
      ) : !data?.summary && !(data?.historyRows.length ?? 0) ? (
        <LedgerSearchCard
          title="Seller not found"
          description="Search again to open seller payout history."
          placeholder="Search seller..."
          users={data?.searchUsers ?? []}
          emptyMessage="The selected seller could not be loaded."
          onSelect={onSelectUser}
        />
      ) : (
        <LedgerTable>
          <thead>
            <tr>
              <th>Date</th>
              <th className="align-right">Net payable</th>
              <th className="align-right">Paid</th>
            </tr>
          </thead>
          <tbody>
            {data?.historyRows.length ? (
              data.historyRows.map((row) => (
                <tr key={row.date}>
                  <td className="cell-strong">{formatDateLabel(row.date)}</td>
                  <td className="align-right">{formatCurrency(row.netPayable)}</td>
                  <td className="align-right ledger-success-text">{formatCurrency(row.paid)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="ledger-empty-row" colSpan={3}>
                  No seller ledger history.
                </td>
              </tr>
            )}
          </tbody>
        </LedgerTable>
      )}
    </div>
  );
}
