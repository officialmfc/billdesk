import type { CSSProperties, ReactNode } from "react";

import type {
  ManagerBuyerPurchaseCard,
  ManagerChalanCard,
  ManagerDueCollectionCard,
  ManagerPaymentAccountCard,
} from "./operations-payments.js";

const tokens = {
  amber: "#b45309",
  amberSoft: "#fef3c7",
  blue: "#2563eb",
  border: "#dbe4ee",
  danger: "#dc2626",
  dangerSoft: "#fee2e2",
  foreground: "#0f172a",
  muted: "#64748b",
  success: "#15803d",
  successSoft: "#dcfce7",
  surface: "rgba(255,255,255,0.98)",
  surfaceMuted: "#f8fafc",
  warning: "#c2410c",
};

const cardStyle: CSSProperties = {
  background: tokens.surface,
  border: `1px solid ${tokens.border}`,
  borderRadius: 24,
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  padding: 20,
};

const tableShellStyle: CSSProperties = {
  border: `1px solid ${tokens.border}`,
  borderRadius: 18,
  overflow: "hidden",
};

const tableHeaderStyle: CSSProperties = {
  alignItems: "center",
  background: tokens.surfaceMuted,
  color: tokens.muted,
  display: "grid",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.18em",
  padding: "10px 14px",
  textTransform: "uppercase",
};

const tableRowStyle: CSSProperties = {
  alignItems: "center",
  borderTop: `1px solid ${tokens.border}`,
  display: "grid",
  gap: 10,
  padding: "12px 14px",
};

const totalRowStyle: CSSProperties = {
  ...tableRowStyle,
  background: "#fbfdff",
  fontWeight: 700,
};

const chipWrapStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const tinyChipStyle: CSSProperties = {
  alignItems: "center",
  background: tokens.surfaceMuted,
  border: `1px solid ${tokens.border}`,
  borderRadius: 999,
  display: "inline-flex",
  gap: 8,
  padding: "6px 10px",
};

const metricGridStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
};

const metricCardStyle: CSSProperties = {
  background: tokens.surfaceMuted,
  border: `1px solid ${tokens.border}`,
  borderRadius: 16,
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: "10px 12px",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatShortDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatLongDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPercent(value: number): string {
  const rounded = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded}%`;
}

function statusPill(status: "paid" | "partial" | "due"): CSSProperties {
  if (status === "paid") {
    return {
      background: tokens.successSoft,
      border: `1px solid rgba(21,128,61,0.18)`,
      color: tokens.success,
    };
  }

  if (status === "partial") {
    return {
      background: tokens.amberSoft,
      border: `1px solid rgba(180,83,9,0.18)`,
      color: tokens.amber,
    };
  }

  return {
    background: tokens.dangerSoft,
    border: `1px solid rgba(220,38,38,0.18)`,
    color: tokens.danger,
  };
}

function StatusPill({
  label,
  status,
}: {
  label: string;
  status: "paid" | "partial" | "due";
}): ReactNode {
  return (
    <div
      style={{
        ...statusPill(status),
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        padding: "6px 10px",
        textTransform: "capitalize",
      }}
    >
      {label}
    </div>
  );
}

export function ManagerDesktopDueCollectionCard({
  action,
  card,
  section,
}: {
  action?: ReactNode;
  card: ManagerDueCollectionCard;
  section: "carry-forward" | "due-today";
}): ReactNode {
  const chips: Array<{
    badge?: string;
    label: string;
    tone: "danger" | "muted" | "success" | "warning";
  }> = [];

  if (card.selectedDateDue > 0) {
    chips.push({
      label: `Due today ${formatCurrency(card.selectedDateDue)}`,
      tone: "warning",
    });
  }

  if (card.selectedDatePayment > 0) {
    chips.push({
      label: `Paid today ${formatCurrency(card.selectedDatePayment)}`,
      tone: "success",
    });
  }

  if (section === "carry-forward") {
    if (card.recentDueEntries.length) {
      chips.push(
        ...card.recentDueEntries.slice(0, 2).map((entry, index) => ({
          badge: index === 0 ? "Latest" : undefined,
          label: `${formatShortDate(entry.date)} ${formatCurrency(entry.amount)}`,
          tone: "muted" as const,
        }))
      );
    } else if (card.latestDueDate) {
      chips.push({
        badge: "Latest",
        label: formatShortDate(card.latestDueDate),
        tone: "muted",
      });
    }
  }

  return (
    <div style={{ ...cardStyle, gap: 12, padding: 16 }}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 12,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>
            {card.businessName || card.name}
          </div>
          <div style={{ color: tokens.muted, fontSize: 13 }}>
            {card.businessName ? card.name : "Customer account"}
          </div>
        </div>
        <div style={{ alignItems: "flex-end", display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ color: tokens.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Total Due
          </div>
          <div style={{ color: tokens.danger, fontSize: 18, fontWeight: 800 }}>
            {formatCurrency(card.totalDueTillDate)}
          </div>
        </div>
      </div>

      {chips.length ? (
        <div style={chipWrapStyle}>
          {chips.map((chip) => (
            <div
              key={chip.label}
              style={{
                ...tinyChipStyle,
                alignItems: "center",
                color:
                  chip.tone === "danger"
                    ? tokens.danger
                    : chip.tone === "success"
                      ? tokens.success
                      : chip.tone === "warning"
                        ? tokens.warning
                        : tokens.muted,
                fontSize: 12,
                fontWeight: chip.tone === "muted" ? 600 : 700,
              }}
            >
              <span>{chip.label}</span>
              {chip.badge ? (
                <span
                  style={{
                    background: "#ffffff",
                    border: `1px solid ${tokens.border}`,
                    borderRadius: 999,
                    color: tokens.foreground,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    textTransform: "uppercase",
                  }}
                >
                  {chip.badge}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {action ? <div style={{ display: "flex", justifyContent: "flex-end" }}>{action}</div> : null}
    </div>
  );
}

export function ManagerDesktopChalanCard({
  action,
  card,
  showBuyerNames,
}: {
  action?: ReactNode;
  card: ManagerChalanCard;
  showBuyerNames: boolean;
}): ReactNode {
  const commissionPercent =
    card.totals.totalAmount > 0
      ? (card.totals.commission / card.totals.totalAmount) * 100
      : 0;

  return (
    <div style={cardStyle}>
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: 16,
          gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {card.sellerName}
          </div>
        </div>
        <StatusPill
          label={card.paymentStatus === "partial" ? "partially paid" : card.paymentStatus}
          status={card.paymentStatus}
        />
        <div
          style={{
            color: tokens.muted,
            fontSize: 13,
            overflow: "hidden",
            textAlign: "right",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {card.chalan.chalan_number} • {formatLongDate(card.chalan.chalan_date)}
        </div>
      </div>

      <div style={tableShellStyle}>
        <div
          style={{
            ...tableHeaderStyle,
            gridTemplateColumns: "52px minmax(0,1.9fr) 0.9fr 0.9fr 1fr",
          }}
        >
          <div>Sl</div>
          <div>{showBuyerNames ? "Buyer" : "Item"}</div>
          <div style={{ textAlign: "right" }}>Weight</div>
          <div style={{ textAlign: "right" }}>Rate</div>
          <div style={{ textAlign: "right" }}>Amount</div>
        </div>
        {card.rows.map((row) => (
          <div
            key={row.id}
            style={{
              ...tableRowStyle,
              gridTemplateColumns: "52px minmax(0,1.9fr) 0.9fr 0.9fr 1fr",
            }}
          >
            <div style={{ color: tokens.muted, fontSize: 13, fontWeight: 700 }}>{row.serialNo}</div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {showBuyerNames ? row.buyerName : row.label}
              </div>
              {showBuyerNames ? (
                <div
                  style={{
                    color: tokens.muted,
                    fontSize: 12,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {`${row.billNumber} • ${row.label}`}
                </div>
              ) : null}
            </div>
            <div style={{ fontSize: 13, textAlign: "right" }}>{row.weight.toFixed(2)} kg</div>
            <div style={{ fontSize: 13, textAlign: "right" }}>{formatCurrency(row.pricePerKg)}</div>
            <div style={{ fontSize: 14, fontWeight: 700, textAlign: "right" }}>{formatCurrency(row.amount)}</div>
          </div>
        ))}
        <div
          style={{
            ...totalRowStyle,
            gridTemplateColumns: "52px minmax(0,1.9fr) 0.9fr 0.9fr 1fr",
          }}
        >
          <div />
          <div>Total</div>
          <div style={{ textAlign: "right" }}>{card.totals.totalWeight.toFixed(2)} kg</div>
          <div />
          <div style={{ textAlign: "right" }}>{formatCurrency(card.totals.totalAmount)}</div>
        </div>
      </div>

      <div
        style={{
          borderTop: `1px solid ${tokens.border}`,
          display: "grid",
          gap: 12,
          gridTemplateColumns: "minmax(0,1fr) auto",
          paddingTop: 14,
        }}
      >
        <div style={{ color: tokens.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
          Commission ({formatPercent(commissionPercent)})
        </div>
        <div style={{ color: tokens.warning, fontSize: 16, fontWeight: 700 }}>
          {formatCurrency(card.totals.commission)}
        </div>
        <div style={{ color: tokens.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
          Payable
        </div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>
          {formatCurrency(card.totals.netPayable)}
        </div>
        {card.paymentStatus === "partial" ? (
          <>
            <div style={{ color: tokens.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
              Paid
            </div>
            <div style={{ color: tokens.success, fontSize: 16, fontWeight: 700 }}>
              {formatCurrency(card.totals.paid)}
            </div>
            <div style={{ color: tokens.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
              Due
            </div>
            <div style={{ color: tokens.danger, fontSize: 16, fontWeight: 800 }}>
              {formatCurrency(card.totals.due)}
            </div>
          </>
        ) : null}
      </div>

      {action ? <div style={{ display: "flex", justifyContent: "flex-end" }}>{action}</div> : null}
    </div>
  );
}

export function ManagerDesktopBuyerPurchaseCard({
  action,
  card,
}: {
  action?: ReactNode;
  card: ManagerBuyerPurchaseCard;
}): ReactNode {
  const previousDue = Math.max(card.totalDueTillDate + card.datePayment - card.totalPurchase, 0);
  const grossDue = previousDue + card.totalPurchase;
  const hasOldDue = previousDue > 0;
  const remainingDue = card.totalDueTillDate;
  const footerRows = [
    ...(hasOldDue
      ? [
        {
          label: "Old due",
          tone: tokens.foreground,
          value: previousDue,
        },
        {
          label: "Total due",
          tone: grossDue > 0 ? tokens.danger : tokens.foreground,
          value: grossDue,
        },
      ]
      : []),
    {
      label: "Payment (today)",
      tone: card.datePayment > 0 ? tokens.success : tokens.foreground,
      value: card.datePayment,
    },
  ];

  return (
    <div style={cardStyle}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 12,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{card.businessName || card.name}</div>
          <div style={{ color: tokens.muted, fontSize: 13 }}>{card.businessName ? card.name : "Buyer account"}</div>
        </div>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "flex-end",
          }}
        >
          <StatusPill label={card.paymentStatus} status={card.paymentStatus} />
          <div style={{ ...tinyChipStyle, fontSize: 12 }}>
            <span style={{ color: tokens.muted }}>Bill</span>
            <strong>{card.billLabel}</strong>
          </div>
        </div>
      </div>

      <div style={tableShellStyle}>
        <div
          style={{
            ...tableHeaderStyle,
            gridTemplateColumns: "52px minmax(0,1.65fr) 0.9fr 0.9fr 1fr",
          }}
        >
          <div>Sl</div>
          <div>Product</div>
          <div style={{ textAlign: "right" }}>Weight</div>
          <div style={{ textAlign: "right" }}>Rate</div>
          <div style={{ textAlign: "right" }}>Amount</div>
        </div>
        {card.items.map((item) => (
          <div
            key={item.id}
            style={{
              ...tableRowStyle,
              gridTemplateColumns: "52px minmax(0,1.65fr) 0.9fr 0.9fr 1fr",
            }}
          >
            <div style={{ color: tokens.muted, fontSize: 13, fontWeight: 700 }}>{item.serialNo}</div>
            <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.label}
            </div>
            <div style={{ fontSize: 13, textAlign: "right" }}>{item.weight.toFixed(2)} kg</div>
            <div style={{ fontSize: 13, textAlign: "right" }}>{formatCurrency(item.pricePerKg)}</div>
            <div style={{ fontSize: 14, fontWeight: 700, textAlign: "right" }}>{formatCurrency(item.amount)}</div>
          </div>
        ))}
        <div
          style={{
            ...totalRowStyle,
            gridTemplateColumns: "52px minmax(0,1.65fr) 0.9fr 0.9fr 1fr",
          }}
        >
          <div />
          <div>Total</div>
          <div style={{ textAlign: "right" }}>{card.totalWeight.toFixed(2)} kg</div>
          <div />
          <div style={{ textAlign: "right" }}>{formatCurrency(card.totalPurchase)}</div>
        </div>
      </div>

      <div
        style={{
          borderTop: `1px solid ${tokens.border}`,
          display: "grid",
          gap: 12,
          paddingTop: 14,
        }}
      >
        <div
          style={{
            display: "grid",
            gap: 8,
          }}
        >
          {footerRows.map((row) => (
            <div
              key={row.label}
              style={{
                alignItems: "baseline",
                display: "grid",
                gap: 16,
                gridTemplateColumns: "minmax(0,1fr) auto",
              }}
            >
              <div
                style={{
                  color: tokens.foreground,
                  fontSize: 15,
                  fontWeight: row.label === "Total due" ? 700 : 500,
                }}
              >
                {row.label}
              </div>
              <div
                style={{
                  color: row.tone,
                  fontSize: 17,
                  fontWeight: 800,
                  textAlign: "right",
                }}
              >
                {formatCurrency(row.value)}
              </div>
            </div>
          ))}

          {remainingDue > 0 ? (
            <div
              style={{
                alignItems: "baseline",
                display: "grid",
                gap: 16,
                gridTemplateColumns: "minmax(0,1fr) auto",
              }}
            >
              <div
                style={{
                  color: tokens.foreground,
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                Remaining
              </div>
              <div
                style={{
                  color: tokens.danger,
                  fontSize: 17,
                  fontWeight: 800,
                  textAlign: "right",
                }}
              >
                {formatCurrency(remainingDue)}
              </div>
            </div>
          ) : (
            <div
              style={{
                color: tokens.success,
                fontSize: 15,
                fontWeight: 800,
                textAlign: "right",
              }}
            >
              All paid
            </div>
          )}
        </div>

        {card.paymentStatus !== "paid" && action ? (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>{action}</div>
        ) : null}
      </div>
    </div>
  );
}

export function ManagerDesktopPaymentAccountCard({
  action,
  card,
}: {
  action?: ReactNode;
  card: ManagerPaymentAccountCard;
}): ReactNode {
  return (
    <div style={cardStyle}>
      <div
        style={{
          alignItems: "flex-start",
          display: "flex",
          gap: 12,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{card.businessName || card.name}</div>
          <div style={{ color: tokens.muted, fontSize: 13 }}>
            {card.latestDueDate ? `Latest due ${formatShortDate(card.latestDueDate)}` : "No recent due"}
          </div>
        </div>
        <div style={{ color: tokens.danger, fontSize: 20, fontWeight: 800 }}>
          {formatCurrency(card.totalDue)}
        </div>
      </div>

      <div style={metricGridStyle}>
        {card.recentDueEntries.map((entry) => (
          <div key={`${entry.reference}-${entry.date}`} style={metricCardStyle}>
            <div style={{ color: tokens.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
              {formatShortDate(entry.date)}
            </div>
            <div style={{ color: tokens.danger, fontSize: 16, fontWeight: 700 }}>
              {formatCurrency(entry.amount)}
            </div>
            <div style={{ color: tokens.muted, fontSize: 12 }}>{entry.reference}</div>
          </div>
        ))}
        {card.lastPaymentDate ? (
          <div style={metricCardStyle}>
            <div style={{ color: tokens.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
              Last Payment
            </div>
            <div style={{ color: tokens.success, fontSize: 16, fontWeight: 700 }}>
              {formatShortDate(card.lastPaymentDate)}
            </div>
            <div style={{ color: tokens.muted, fontSize: 12 }}>{card.openItemCount} open items</div>
          </div>
        ) : null}
      </div>

      {action ? <div style={{ display: "flex", justifyContent: "flex-end" }}>{action}</div> : null}
    </div>
  );
}
