import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ManagerDesktopBuyerPurchaseCard,
  ManagerDesktopChalanCard,
  ManagerDateNavigator,
  ManagerDesktopDueCollectionCard,
  ManagerDesktopPaymentAccountCard,
} from "@mfc/manager-ui";

import type {
  DesktopManagerSpendingInput,
  DesktopOperationsSummary,
  DesktopPaymentsOverview,
  DesktopSpendingsOverview,
  SelectionOption,
} from "../../shared/contracts";
import {
  DesktopCustomerPaymentDialog,
  DesktopSellerPayoutDialog,
} from "./payment-entry-dialogs";
import {
  DesktopBuyerPurchasePrintContent,
  DesktopChalanPrintContent,
  DesktopPrintButton,
} from "./desktop-print";

type DesktopMessage = { tone: "error" | "success" | "warning"; text: string } | null;

const SPENDING_CATEGORIES = [
  { label: "Tea snacks", value: "tea-snacks" },
  { label: "Transport", value: "transport" },
  { label: "Loading", value: "loading" },
  { label: "Packing", value: "packing" },
  { label: "Utilities", value: "utilities" },
  { label: "Misc", value: "misc" },
] as const;

const SPENDING_PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "Bank transfer", value: "bank_transfer" },
  { label: "UPI", value: "upi" },
  { label: "Check", value: "check" },
] as const;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

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

function formatTag(value: string): string {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function PageIntro({
  title,
  subtitle,
}: {
  subtitle: string;
  title: string;
}): ReactElement {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
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

function useDesktopOperations(dateStr: string, refreshKey: number) {
  const [data, setData] = useState<DesktopOperationsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void window.managerDesktopApi.operations
      .getSummary(dateStr)
      .then((next) => {
        if (cancelled) {
          return;
        }
        setData(next);
      })
      .catch((reason) => {
        if (cancelled) {
          return;
        }
        setError(reason instanceof Error ? reason.message : "Could not load operations.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dateStr, refreshKey]);

  return { data, error, loading };
}

function useDesktopPayments(search: string, refreshKey: number) {
  const [data, setData] = useState<DesktopPaymentsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void window.managerDesktopApi.payments
      .getOverview(search)
      .then((next) => {
        if (cancelled) {
          return;
        }
        setData(next);
      })
      .catch((reason) => {
        if (cancelled) {
          return;
        }
        setError(reason instanceof Error ? reason.message : "Could not load payments.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey, search]);

  return { data, error, loading };
}

function useDesktopSpendings(dateStr: string, search: string, refreshKey: number) {
  const [data, setData] = useState<DesktopSpendingsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void window.managerDesktopApi.payments
      .getSpendingsOverview(dateStr, search)
      .then((next) => {
        if (cancelled) {
          return;
        }
        setData(next);
      })
      .catch((reason) => {
        if (cancelled) {
          return;
        }
        setError(reason instanceof Error ? reason.message : "Could not load spendings.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dateStr, refreshKey, search]);

  return { data, error, loading };
}

function toAccountOption(
  label: string,
  value: string,
  metaValue: number,
  description?: string | null
): SelectionOption {
  return {
    description: description ?? null,
    label,
    meta: String(metaValue),
    value,
  };
}

export function DesktopOperationsOverviewPage({
  onNavigate,
}: {
  onNavigate: (view: "due-collection" | "chalans" | "buyer-purchases" | "verification") => void;
}): ReactElement {
  const cards = [
    { title: "Customer Due & Collection", view: "due-collection" as const },
    { title: "Daily Chalans", view: "chalans" as const },
    { title: "Buyer Purchases", view: "buyer-purchases" as const },
    { title: "Chalan Verification", view: "verification" as const },
  ];

  return (
    <div className="page-panel">
      <PageIntro title="Operations" subtitle="Compact daily registers and follow-up views." />
      <div className="sales-grid">
        {cards.map((card) => (
          <button key={card.view} className="tile" onClick={() => onNavigate(card.view)}>
            <div className="tile-title">{card.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function DesktopDueCollectionPage({
  onMessage,
}: {
  onMessage: (message: DesktopMessage) => void;
}): ReactElement {
  const [dateStr, setDateStr] = useState(getCurrentDateIST());
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, error, loading } = useDesktopOperations(dateStr, refreshKey);
  const accountOptions = useMemo(
    () =>
      [
        ...(data?.dueRegister.selectedDateCards ?? []),
        ...(data?.dueRegister.carryForwardCards ?? []),
      ].map((card) =>
        toAccountOption(
          card.businessName || card.name,
          card.customerId,
          card.totalDueTillDate,
          card.latestDueDate ? `Latest due ${card.latestDueDate}` : null
        )
      ),
    [data?.dueRegister]
  );

  return (
    <div className="page-panel">
      <PageIntro title="Customer Due & Collection" subtitle="Compact due register with payment actions inline." />
      <DesktopDateToolbar dateStr={dateStr} onChange={setDateStr} />
      {error ? <div className="banner error">{error}</div> : null}
      {loading ? (
        <div className="content-card">Loading due cards...</div>
      ) : (
        <>
          <div className="section-heading">
            <div>
              <h2>Due Today</h2>
            </div>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {data?.dueRegister.selectedDateCards.length ? (
              data.dueRegister.selectedDateCards.map((card) => (
                <ManagerDesktopDueCollectionCard
                  key={card.customerId}
                  card={card}
                  section="due-today"
                  action={
                    <DesktopCustomerPaymentDialog
                      accountOptions={accountOptions}
                      onMessage={onMessage}
                      onSuccess={async () => setRefreshKey((current) => current + 1)}
                      presetCustomerId={card.customerId}
                      presetCustomerName={card.businessName || card.name}
                      presetPaymentDate={dateStr}
                      triggerLabel="Add payment"
                    />
                  }
                />
              ))
            ) : (
              <div className="content-card">No due today.</div>
            )}
          </div>

          <div className="section-heading">
            <div>
              <h2>Carry Forward</h2>
            </div>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {data?.dueRegister.carryForwardCards.length ? (
              data.dueRegister.carryForwardCards.map((card) => (
                <ManagerDesktopDueCollectionCard
                  key={card.customerId}
                  card={card}
                  section="carry-forward"
                  action={
                    <DesktopCustomerPaymentDialog
                      accountOptions={accountOptions}
                      onMessage={onMessage}
                      onSuccess={async () => setRefreshKey((current) => current + 1)}
                      presetCustomerId={card.customerId}
                      presetCustomerName={card.businessName || card.name}
                      presetPaymentDate={dateStr}
                      triggerLabel="Add payment"
                    />
                  }
                />
              ))
            ) : (
              <div className="content-card">No carry forward accounts.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function DesktopDailyChalansPage({
  onMessage,
}: {
  onMessage: (message: DesktopMessage) => void;
}): ReactElement {
  const [dateStr, setDateStr] = useState(getCurrentDateIST());
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, error, loading } = useDesktopOperations(dateStr, refreshKey);
  const sellerOptions = useMemo(
    () =>
      (data?.chalans ?? [])
        .filter((card) => Boolean(card.chalan.seller_id))
        .map((card) =>
          toAccountOption(
            card.sellerName,
            card.chalan.seller_id!,
            card.dueAmount,
            `${card.chalan.chalan_number} • ${card.chalan.chalan_date}`
          )
        ),
    [data?.chalans]
  );

  return (
    <div className="page-panel">
      <PageIntro title="Daily Chalans" subtitle="Seller register with compact totals and deductions." />
      <DesktopDateToolbar dateStr={dateStr} onChange={setDateStr} />
      {error ? <div className="banner error">{error}</div> : null}
      {loading ? (
        <div className="content-card">Loading chalan register...</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {data?.chalans.length ? (
            data.chalans.map((card) => (
                <ManagerDesktopChalanCard
                  key={card.chalan.id}
                  card={card}
                  showBuyerNames={false}
                  action={
                    <div className="desktop-inline-actions">
                      <DesktopPrintButton
                        documentTitle="Chalan"
                        paper="thermal"
                        trigger={<button className="secondary-button" type="button">Print</button>}
                      >
                        <DesktopChalanPrintContent card={card} />
                      </DesktopPrintButton>
                      {card.showRecordPayout ? (
                        <DesktopSellerPayoutDialog
                          onMessage={onMessage}
                          onSuccess={async () => setRefreshKey((current) => current + 1)}
                          presetPaymentDate={dateStr}
                          presetSellerId={card.chalan.seller_id ?? undefined}
                          presetSellerName={card.sellerName}
                          sellerOptions={sellerOptions}
                          triggerLabel="Record payout"
                        />
                      ) : undefined}
                    </div>
                  }
                />
              ))
          ) : (
            <div className="content-card">No chalans for this date.</div>
          )}
        </div>
      )}
    </div>
  );
}

export function DesktopBuyerPurchasesPage({
  onMessage,
}: {
  onMessage: (message: DesktopMessage) => void;
}): ReactElement {
  const [dateStr, setDateStr] = useState(getCurrentDateIST());
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, error, loading } = useDesktopOperations(dateStr, refreshKey);
  const accountOptions = useMemo(
    () =>
      (data?.buyerCards ?? []).map((card) =>
        toAccountOption(
          card.businessName || card.name,
          card.customerId,
          card.totalDueTillDate,
          card.billEntries[0]?.billDate ? `Latest bill ${card.billEntries[0].billDate}` : null
        )
      ),
    [data?.buyerCards]
  );

  return (
    <div className="page-panel">
      <PageIntro title="Buyer Purchases" subtitle="Buyer cards with bill number, totals, due, and payment status." />
      <DesktopDateToolbar dateStr={dateStr} onChange={setDateStr} />
      {error ? <div className="banner error">{error}</div> : null}
      {loading ? (
        <div className="content-card">Loading buyer purchases...</div>
      ) : (
        <div className="sales-grid">
          {data?.buyerCards.length ? (
            data.buyerCards.map((card) => (
                <ManagerDesktopBuyerPurchaseCard
                  key={card.customerId}
                  card={card}
                  action={
                    <div className="desktop-inline-actions">
                      <DesktopPrintButton
                        documentTitle="Buyer Bill"
                        paper="thermal"
                        trigger={<button className="secondary-button" type="button">Print</button>}
                      >
                        <DesktopBuyerPurchasePrintContent card={card} date={dateStr} />
                      </DesktopPrintButton>
                      {card.showAddPayment ? (
                        <DesktopCustomerPaymentDialog
                          accountOptions={accountOptions}
                          onMessage={onMessage}
                          onSuccess={async () => setRefreshKey((current) => current + 1)}
                          presetCustomerId={card.customerId}
                          presetCustomerName={card.businessName || card.name}
                          presetPaymentDate={dateStr}
                          triggerLabel="Add payment"
                        />
                      ) : undefined}
                    </div>
                  }
                />
              ))
          ) : (
            <div className="content-card">No buyer purchases for this date.</div>
          )}
        </div>
      )}
    </div>
  );
}

export function DesktopChalanVerificationPage(): ReactElement {
  const [dateStr, setDateStr] = useState(getCurrentDateIST());
  const { data, error, loading } = useDesktopOperations(dateStr, 0);

  return (
    <div className="page-panel">
      <PageIntro title="Chalan Verification" subtitle="Internal buyer-name check for the selected day." />
      <DesktopDateToolbar dateStr={dateStr} onChange={setDateStr} />
      {error ? <div className="banner error">{error}</div> : null}
      {loading ? (
        <div className="content-card">Loading verification cards...</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {data?.verificationCards.length ? (
            data.verificationCards.map((card) => (
              <ManagerDesktopChalanCard key={card.chalan.id} card={card} showBuyerNames />
            ))
          ) : (
            <div className="content-card">No verification cards for this date.</div>
          )}
        </div>
      )}
    </div>
  );
}

function DesktopManagerSpendingDialog({
  onMessage,
  onSuccess,
  presetDate,
  triggerLabel,
}: {
  onMessage: (message: DesktopMessage) => void;
  onSuccess?: () => Promise<void> | void;
  presetDate: string;
  triggerLabel: string;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("misc");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<DesktopManagerSpendingInput["paymentMethod"]>("cash");
  const [spentDate, setSpentDate] = useState(presetDate);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setSpentDate(presetDate);
    }
  }, [open, presetDate]);

  const resetForm = () => {
    setTitle("");
    setCategory("misc");
    setAmount("");
    setPaymentMethod("cash");
    setSpentDate(presetDate);
    setNote("");
  };

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);
    if (!title.trim()) {
      onMessage({ tone: "warning", text: "Add a spending title." });
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      onMessage({ tone: "warning", text: "Enter a valid spending amount." });
      return;
    }

    try {
      setSubmitting(true);
      await window.managerDesktopApi.payments.createManagerSpending({
        amount: parsedAmount,
        category,
        note: note.trim() || null,
        paymentMethod,
        spentDate,
        title: title.trim(),
      });
      onMessage({ tone: "success", text: "Spending recorded." });
      setOpen(false);
      resetForm();
      await onSuccess?.();
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not record spending.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        className="primary-button"
        type="button"
        onClick={() => {
          resetForm();
          setOpen(true);
        }}
      >
        {triggerLabel}
      </button>
      {open ? (
        <div
          className="desktop-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div className="desktop-modal-card">
            <div className="desktop-modal-header">
              <div>
                <h2 className="desktop-modal-title">Add spending</h2>
                <p className="desktop-modal-description">
                  Record a manager-side operational spend inside payments.
                </p>
              </div>
              <button className="ghost-button" onClick={() => setOpen(false)} type="button">
                Close
              </button>
            </div>
            <div className="desktop-modal-body">
              <div className="field-grid">
                <div className="field-block" style={{ gridColumn: "1 / -1" }}>
                  <label className="field-label">Title</label>
                  <input
                    className="text-input"
                    placeholder="Tea, fuel, transport, labour..."
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </div>
                <div className="field-block">
                  <label className="field-label">Spent date</label>
                  <input
                    className="text-input"
                    type="date"
                    value={spentDate}
                    onChange={(event) => setSpentDate(event.target.value)}
                  />
                </div>
                <div className="field-block">
                  <label className="field-label">Amount</label>
                  <input
                    className="text-input"
                    inputMode="decimal"
                    placeholder="0"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                </div>
                <div className="field-block">
                  <label className="field-label">Category</label>
                  <select
                    className="text-input"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    {SPENDING_CATEGORIES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field-block">
                  <label className="field-label">Payment method</label>
                  <select
                    className="text-input"
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value as DesktopManagerSpendingInput["paymentMethod"])
                    }
                  >
                    {SPENDING_PAYMENT_METHODS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field-block" style={{ gridColumn: "1 / -1" }}>
                  <label className="field-label">Note</label>
                  <textarea
                    className="text-input"
                    style={{ minHeight: 110, padding: 14, resize: "vertical" }}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </div>
              </div>
              <div className="dialog-actions">
                <button
                  className="secondary-button"
                  disabled={submitting}
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="primary-button"
                  disabled={submitting}
                  onClick={() => void handleSubmit()}
                  type="button"
                >
                  {submitting ? "Saving..." : "Save spending"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function DesktopPaymentsPage({
  initialSegment = "customer",
  onMessage,
}: {
  initialSegment?: "customer" | "seller" | "spendings";
  onMessage: (message: DesktopMessage) => void;
}): ReactElement {
  const [segment, setSegment] = useState<"customer" | "seller" | "spendings">(initialSegment);
  const [search, setSearch] = useState("");
  const [spendingDate, setSpendingDate] = useState(getCurrentDateIST());
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, error, loading } = useDesktopPayments(search, refreshKey);
  const {
    data: spendingsData,
    error: spendingsError,
    loading: spendingsLoading,
  } = useDesktopSpendings(spendingDate, search, refreshKey);

  const activeAccounts = useMemo(
    () => (segment === "customer" ? data?.customerAccounts ?? [] : data?.sellerAccounts ?? []),
    [data, segment]
  );
  const customerOptions = useMemo(
    () =>
      (data?.customerAccounts ?? []).map((account) =>
        toAccountOption(
          account.businessName || account.name,
          account.userId,
          account.totalDue,
          account.latestDueDate ? `Latest due ${account.latestDueDate}` : null
        )
      ),
    [data?.customerAccounts]
  );
  const sellerOptions = useMemo(
    () =>
      (data?.sellerAccounts ?? []).map((account) =>
        toAccountOption(
          account.businessName || account.name,
          account.userId,
          account.totalDue,
          account.latestDueDate ? `Latest due ${account.latestDueDate}` : null
        )
      ),
    [data?.sellerAccounts]
  );

  return (
    <div className="page-panel">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
        </div>
        <div className="header-actions">
          <button
            className={segment === "customer" ? "primary-button" : "secondary-button"}
            onClick={() => setSegment("customer")}
          >
            Customer payment
          </button>
          <button
            className={segment === "seller" ? "primary-button" : "secondary-button"}
            onClick={() => setSegment("seller")}
          >
            Seller payout
          </button>
          <button
            className={segment === "spendings" ? "primary-button" : "secondary-button"}
            onClick={() => setSegment("spendings")}
          >
            Spendings
          </button>
        </div>
      </div>

      <div className="content-card desktop-payments-toolbar" style={{ padding: 16 }}>
        <input
          className="text-input"
          placeholder={
            segment === "customer"
              ? "Search accounts, business, or bill"
              : segment === "seller"
                ? "Search sellers, business, or chalan"
                : "Search title, category, note, or manager"
          }
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {segment === "spendings" ? (
          <>
            <input
              className="text-input"
              type="date"
              value={spendingDate}
              onChange={(event) => setSpendingDate(event.target.value)}
            />
            <DesktopManagerSpendingDialog
              onMessage={onMessage}
              onSuccess={async () => setRefreshKey((current) => current + 1)}
              presetDate={spendingDate}
              triggerLabel="Add spend"
            />
          </>
        ) : segment === "customer" ? (
          <DesktopCustomerPaymentDialog
            accountOptions={customerOptions}
            onMessage={onMessage}
            onSuccess={async () => setRefreshKey((current) => current + 1)}
            triggerLabel="Add payment"
            triggerVariant="primary"
          />
        ) : (
          <DesktopSellerPayoutDialog
            onMessage={onMessage}
            onSuccess={async () => setRefreshKey((current) => current + 1)}
            sellerOptions={sellerOptions}
            triggerLabel="Add payout"
            triggerVariant="primary"
          />
        )}
      </div>

      {segment === "spendings" ? (
        spendingsError ? <div className="banner error">{spendingsError}</div> : null
      ) : error ? (
        <div className="banner error">{error}</div>
      ) : null}

      {segment === "spendings" ? (
        spendingsLoading ? (
          <div className="content-card">Loading spendings...</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div className="sales-grid" style={{ gridTemplateColumns: "220px minmax(0, 1fr)" }}>
              <div className="content-card">
                <div className="tile-title">Total spend</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: 10 }}>
                  {formatCurrency(spendingsData?.totalAmount ?? 0)}
                </div>
                <div className="page-subtitle" style={{ marginTop: 6 }}>
                  {spendingDate}
                </div>
              </div>
              <div className="content-card">
                <div className="tile-title">Category totals</div>
                {spendingsData?.categoryTotals.length ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                      marginTop: 12,
                    }}
                  >
                    {spendingsData.categoryTotals.map((entry) => (
                      <div
                        key={entry.category}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: 999,
                          padding: "10px 14px",
                          background: "var(--surface-muted)",
                        }}
                      >
                        <strong>{formatTag(entry.category)}</strong>
                        <span style={{ color: "var(--muted)", marginLeft: 8 }}>
                          {formatCurrency(entry.totalAmount)} • {entry.count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="page-subtitle" style={{ marginTop: 10 }}>
                    No spendings matched this filter.
                  </div>
                )}
              </div>
            </div>

            {spendingsData?.rows.length ? (
              <div style={{ display: "grid", gap: 12 }}>
                {spendingsData.rows.map((row) => (
                  <div key={row.id} className="content-card">
                    <div className="desktop-inline-actions" style={{ justifyContent: "space-between" }}>
                      <div style={{ minWidth: 0 }}>
                        <div className="tile-title" style={{ fontSize: "1.02rem", textTransform: "none" }}>
                          {row.title}
                        </div>
                        <div className="page-subtitle" style={{ marginTop: 6 }}>
                          {row.spentDate} • {formatTag(row.category)} • {formatTag(row.paymentMethod)}
                          {row.createdByName ? ` • ${row.createdByName}` : ""}
                        </div>
                        {row.note ? (
                          <div style={{ color: "var(--muted)", marginTop: 8 }}>{row.note}</div>
                        ) : null}
                      </div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                        {formatCurrency(row.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="content-card">No spendings matched this filter.</div>
            )}
          </div>
        )
      ) : (
        loading ? (
          <div className="content-card">Loading payments...</div>
        ) : (
          <div className="sales-grid">
            {activeAccounts.length ? (
              activeAccounts.map((card) => (
                <ManagerDesktopPaymentAccountCard
                  key={card.userId}
                  card={card}
                  action={
                    segment === "customer" ? (
                      <DesktopCustomerPaymentDialog
                        accountOptions={customerOptions}
                        onMessage={onMessage}
                        onSuccess={async () => setRefreshKey((current) => current + 1)}
                        presetCustomerId={card.userId}
                        presetCustomerName={card.businessName || card.name}
                        triggerLabel="Add payment"
                      />
                    ) : (
                      <DesktopSellerPayoutDialog
                        onMessage={onMessage}
                        onSuccess={async () => setRefreshKey((current) => current + 1)}
                        presetSellerId={card.userId}
                        presetSellerName={card.businessName || card.name}
                        sellerOptions={sellerOptions}
                        triggerLabel="Add payout"
                      />
                    )
                  }
                />
              ))
            ) : (
              <div className="content-card">No due accounts matched this search.</div>
            )}
          </div>
        )
      )}
    </div>
  );
}
