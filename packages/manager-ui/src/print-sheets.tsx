import type { CSSProperties, ReactNode } from "react";

const tokens = {
  border: "#dbe4ee",
  danger: "#dc2626",
  foreground: "#0f172a",
  muted: "#64748b",
  success: "#15803d",
  successSoft: "#dcfce7",
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  warning: "#b45309",
};

const shellStyle: CSSProperties = {
  background: tokens.surface,
  border: `1px solid ${tokens.border}`,
  borderRadius: 28,
  boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
  display: "flex",
  flexDirection: "column",
  gap: 24,
  margin: "0 auto",
  maxWidth: 1080,
  padding: 28,
};

const documentShellStyle: CSSProperties = {
  display: "grid",
  gap: 18,
};

const coverStyle: CSSProperties = {
  background: tokens.surface,
  border: `1px solid ${tokens.border}`,
  borderRadius: 28,
  boxShadow: "0 12px 36px rgba(15, 23, 42, 0.06)",
  display: "grid",
  gap: 18,
  margin: "0 auto",
  maxWidth: 1080,
  padding: 26,
};

const tableShellStyle: CSSProperties = {
  border: `1px solid ${tokens.border}`,
  borderRadius: 20,
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
  padding: "12px 18px",
  textTransform: "uppercase",
};

const tableRowStyle: CSSProperties = {
  alignItems: "center",
  borderTop: `1px solid ${tokens.border}`,
  display: "grid",
  gap: 12,
  padding: "14px 18px",
};

const totalRowStyle: CSSProperties = {
  ...tableRowStyle,
  background: "#fbfdff",
  fontWeight: 700,
};

const chipStyle: CSSProperties = {
  alignItems: "center",
  border: `1px solid ${tokens.border}`,
  borderRadius: 999,
  display: "inline-flex",
  fontSize: 13,
  gap: 8,
  padding: "8px 12px",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatWeight(value: number): string {
  return `${value.toFixed(2)} kg`;
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type StatusTone = "due" | "paid" | "partial";

function renderStatusPill(label: string, tone: StatusTone): ReactNode {
  const styleMap: Record<StatusTone, CSSProperties> = {
    due: {
      background: "#fee2e2",
      border: "1px solid rgba(220,38,38,0.18)",
      color: tokens.danger,
    },
    partial: {
      background: "#fef3c7",
      border: "1px solid rgba(180,83,9,0.18)",
      color: tokens.warning,
    },
    paid: {
      background: tokens.successSoft,
      border: "1px solid rgba(21,128,61,0.18)",
      color: tokens.success,
    },
  };

  return (
    <div
      style={{
        ...styleMap[tone],
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        padding: "8px 14px",
        textTransform: "capitalize",
      }}
    >
      {label}
    </div>
  );
}

export function ManagerPrintableDocument({
  address,
  businessName,
  children,
  documentTitle,
  email,
  gst,
  headerMode,
  paper = "a4",
  phone,
}: {
  address?: string | null;
  businessName: string;
  children: ReactNode;
  documentTitle: string;
  email?: string | null;
  gst?: string | null;
  headerMode?: "compact" | "full";
  paper?: "a4" | "thermal";
  phone?: string | null;
}): ReactNode {
  const isThermal = paper === "thermal";
  const contactBits = [phone, email].filter(Boolean).join(" • ");
  const resolvedHeaderMode = headerMode ?? (isThermal ? "compact" : "full");

  if (isThermal) {
    return (
      <div style={{ ...documentShellStyle, gap: 10 }}>
        <div
          style={{
            display: "grid",
            gap: 6,
            padding: "4px 2px 0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.05 }}>{businessName}</div>
          {address ? (
            <div style={{ color: tokens.muted, fontSize: 10, lineHeight: 1.45 }}>{address}</div>
          ) : null}
          {contactBits ? (
            <div style={{ color: tokens.muted, fontSize: 10, lineHeight: 1.4 }}>{contactBits}</div>
          ) : null}
          {gst ? (
            <div style={{ color: tokens.muted, fontSize: 10 }}>GST: {gst}</div>
          ) : null}
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: "0.08em",
              marginTop: 4,
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            {documentTitle}
          </div>
        </div>
        {children}
      </div>
    );
  }

  if (resolvedHeaderMode === "compact") {
    return (
      <div style={{ ...documentShellStyle, gap: 12 }}>
        <div
          style={{
            alignItems: "end",
            borderBottom: `1px solid ${tokens.border}`,
            display: "grid",
            gap: 16,
            gridTemplateColumns: "minmax(0,1fr) auto",
            padding: "0 0 8px",
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.02 }}>{businessName}</div>
          <div
            style={{
              color: tokens.muted,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {documentTitle}
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div style={documentShellStyle}>
      <div
        style={{
          ...coverStyle,
          borderRadius: isThermal ? 18 : 28,
          gap: isThermal ? 12 : 18,
          maxWidth: "100%",
          padding: isThermal ? 14 : 26,
        }}
      >
        <div
          style={{
            alignItems: "flex-start",
            display: "grid",
            gap: isThermal ? 10 : 16,
            gridTemplateColumns: isThermal ? "1fr" : "minmax(0,1fr) auto",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: tokens.muted,
                fontSize: isThermal ? 10 : 12,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Mondal Fish Center
            </div>
            <div
              style={{
                fontSize: isThermal ? 18 : 30,
                fontWeight: 800,
                lineHeight: 1.1,
                marginTop: 8,
              }}
            >
              {businessName}
            </div>
            {address ? (
              <div
                style={{
                  color: tokens.muted,
                  fontSize: isThermal ? 11 : 14,
                  lineHeight: 1.6,
                  marginTop: 10,
                }}
              >
                {address}
              </div>
            ) : null}
            {contactBits ? (
              <div style={{ color: tokens.muted, fontSize: isThermal ? 10 : 13, marginTop: 8 }}>
                {contactBits}
              </div>
            ) : null}
            {gst ? (
              <div style={{ color: tokens.muted, fontSize: isThermal ? 10 : 13, marginTop: 4 }}>
                GST: {gst}
              </div>
            ) : null}
          </div>
          <div
            style={{
              alignItems: "flex-end",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              textAlign: isThermal ? "left" : "right",
            }}
          >
            <div
              style={{
                color: tokens.muted,
                fontSize: isThermal ? 10 : 12,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Print Sheet
            </div>
            <div style={{ fontSize: isThermal ? 16 : 24, fontWeight: 800 }}>{documentTitle}</div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export type ManagerPrintableLineRow = {
  amount: number;
  id: string;
  label: string;
  rate?: number | null;
  serialNo: number;
  sublabel?: string | null;
  weight: number;
};

export type ManagerPrintableLineSheetSummaryRow = {
  label: string;
  tone?: "danger" | "default" | "success" | "warning";
  value: number;
};

export type ManagerPrintableBillRow = {
  amount: number;
  id: string;
  label: string;
  rate: number;
  serialNo: number;
  weight: number;
};

export function ManagerPrintableLineSheet({
  headerMeta,
  headerTitle,
  paper = "a4",
  rows,
  status,
  summaryRows,
  totalAmount,
  totalWeight,
}: {
  headerMeta: string;
  headerTitle: string;
  paper?: "a4" | "thermal";
  rows: ManagerPrintableLineRow[];
  status?: {
    label: string;
    tone: StatusTone;
  };
  summaryRows: ManagerPrintableLineSheetSummaryRow[];
  totalAmount: number;
  totalWeight: number;
}): ReactNode {
  const isThermal = paper === "thermal";
  const columns = isThermal
    ? "28px minmax(0,1.45fr) 0.72fr 0.72fr 0.95fr"
    : "56px minmax(0,1.8fr) 0.9fr 0.9fr 1fr";

  return (
    <div
      style={{
        ...shellStyle,
        border: isThermal ? "none" : shellStyle.border,
        borderRadius: isThermal ? 0 : 28,
        boxShadow: isThermal ? "none" : shellStyle.boxShadow,
        gap: isThermal ? 12 : 24,
        maxWidth: "100%",
        padding: isThermal ? 0 : 28,
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: isThermal ? 10 : 16,
          gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)",
        }}
      >
        <div style={{ fontSize: isThermal ? 16 : 20, fontWeight: 800, minWidth: 0 }}>{headerTitle}</div>
        {status ? renderStatusPill(status.label, status.tone) : <div />}
        <div
          style={{
            color: tokens.muted,
            fontSize: isThermal ? 11 : 14,
            overflow: "hidden",
            textAlign: "right",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {headerMeta}
        </div>
      </div>

      <div style={tableShellStyle}>
        <div
          style={{
            ...tableHeaderStyle,
            fontSize: isThermal ? 9 : 11,
            gridTemplateColumns: columns,
            padding: isThermal ? "10px 12px" : "12px 18px",
          }}
        >
          <div>Sl</div>
          <div>Item</div>
          <div style={{ textAlign: "right" }}>Weight</div>
          <div style={{ textAlign: "right" }}>Rate</div>
          <div style={{ textAlign: "right" }}>Amount</div>
        </div>
        {rows.map((row) => (
          <div
            key={row.id}
            style={{
              ...tableRowStyle,
              gridTemplateColumns: columns,
              padding: isThermal ? "10px 12px" : "14px 18px",
            }}
          >
            <div style={{ color: tokens.muted, fontSize: isThermal ? 11 : 14, fontWeight: 700 }}>
              {row.serialNo}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: isThermal ? 12 : 15,
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {row.label}
              </div>
              {row.sublabel ? (
                <div
                  style={{
                    color: tokens.muted,
                    fontSize: isThermal ? 10 : 13,
                    marginTop: 4,
                  }}
                >
                  {row.sublabel}
                </div>
              ) : null}
            </div>
            <div style={{ fontSize: isThermal ? 11 : 14, textAlign: "right" }}>{formatWeight(row.weight)}</div>
            <div style={{ fontSize: isThermal ? 11 : 14, textAlign: "right" }}>
              {row.rate !== undefined && row.rate !== null ? formatCurrency(row.rate) : "—"}
            </div>
            <div style={{ fontSize: isThermal ? 13 : 16, fontWeight: 800, textAlign: "right" }}>
              {formatCurrency(row.amount)}
            </div>
          </div>
        ))}
        <div
          style={{
            ...totalRowStyle,
            gridTemplateColumns: columns,
            padding: isThermal ? "10px 12px" : "14px 18px",
          }}
        >
          <div />
          <div>Total</div>
          <div style={{ textAlign: "right" }}>{formatWeight(totalWeight)}</div>
          <div />
          <div style={{ textAlign: "right" }}>{formatCurrency(totalAmount)}</div>
        </div>
      </div>

      <div
        style={{
          borderTop: isThermal ? "none" : `1px solid ${tokens.border}`,
          display: "grid",
          gap: isThermal ? 8 : 10,
          paddingTop: isThermal ? 0 : 18,
        }}
      >
        {summaryRows.map((row) => (
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
                color: tokens.muted,
                fontSize: isThermal ? 12 : 15,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {row.label}
            </div>
            <div
              style={{
                color:
                  row.tone === "danger"
                    ? tokens.danger
                    : row.tone === "success"
                      ? tokens.success
                      : row.tone === "warning"
                        ? tokens.warning
                        : tokens.foreground,
                fontSize: isThermal ? 15 : 19,
                fontWeight: 800,
                textAlign: "right",
              }}
            >
              {formatCurrency(row.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ManagerPrintableBillSheet({
  billLabel,
  customerLabel,
  date,
  documentTitle: _documentTitle,
  dueAmount,
  paidAmount,
  rows,
  totalAmount,
  totalWeight,
}: {
  billLabel: string;
  customerLabel: string;
  date: string;
  documentTitle: string;
  dueAmount: number;
  paidAmount: number;
  rows: ManagerPrintableBillRow[];
  totalAmount: number;
  totalWeight: number;
}): ReactNode {
  return (
    <div
      style={{
        ...shellStyle,
        border: "none",
        borderRadius: 0,
        boxShadow: "none",
        gap: 8,
        maxWidth: "100%",
        padding: "0 1.5px",
      }}
    >
      <div
        style={{
          display: "grid",
          gap: 4,
        }}
      >
        <div
          style={{
            color: tokens.muted,
            display: "grid",
            fontSize: 10,
            fontWeight: 600,
            gridTemplateColumns: "minmax(0,1fr) auto",
          }}
        >
          <div>{billLabel}</div>
          <div>{formatDate(date)}</div>
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          {customerLabel}
        </div>
      </div>

      <div
        style={{
          border: `1px solid ${tokens.border}`,
          borderRadius: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            ...tableHeaderStyle,
            fontSize: 9,
            gridTemplateColumns: "24px minmax(0,1.4fr) 0.78fr 0.72fr 0.9fr",
            padding: "7px 8px",
          }}
        >
          <div>Sl</div>
          <div>Item</div>
          <div style={{ textAlign: "right" }}>Weight</div>
          <div style={{ textAlign: "right" }}>Rate</div>
          <div style={{ textAlign: "right" }}>Amount</div>
        </div>

        {rows.map((row) => (
          <div
            key={row.id}
            style={{
              ...tableRowStyle,
              gap: 8,
              gridTemplateColumns: "24px minmax(0,1.4fr) 0.78fr 0.72fr 0.9fr",
              padding: "8px",
            }}
          >
            <div style={{ color: tokens.muted, fontSize: 11, fontWeight: 700 }}>{row.serialNo}</div>
            <div style={{ fontSize: 12, fontWeight: 700, minWidth: 0 }}>{row.label}</div>
            <div style={{ fontSize: 12, lineHeight: 1.1, textAlign: "right" }}>{formatWeight(row.weight)}</div>
            <div style={{ fontSize: 12, textAlign: "right" }}>{formatCurrency(row.rate)}</div>
            <div style={{ fontSize: 15, fontWeight: 800, textAlign: "right" }}>{formatCurrency(row.amount)}</div>
          </div>
        ))}

        <div
          style={{
            ...totalRowStyle,
            gap: 8,
            gridTemplateColumns: "24px minmax(0,1.4fr) 0.78fr 0.72fr 0.9fr",
            padding: "8px",
          }}
        >
          <div />
          <div />
          <div style={{ fontSize: 15, fontWeight: 800, textAlign: "right" }}>{formatWeight(totalWeight)}</div>
          <div />
          <div style={{ fontSize: 17, fontWeight: 800, textAlign: "right" }}>{formatCurrency(totalAmount)}</div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 6,
          marginTop: 2,
        }}
      >
        <div
          style={{
            alignItems: "baseline",
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) auto",
          }}
        >
          <div
            style={{
              color: tokens.muted,
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Paid
          </div>
          <div
            style={{
              color: paidAmount > 0 ? tokens.success : tokens.foreground,
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            {formatCurrency(paidAmount)}
          </div>
        </div>
        <div
          style={{
            alignItems: "baseline",
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) auto",
          }}
        >
          <div
            style={{
              color: tokens.muted,
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Due
          </div>
          <div
            style={{
              color: dueAmount > 0 ? tokens.danger : tokens.foreground,
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            {formatCurrency(dueAmount)}
          </div>
        </div>
      </div>
    </div>
  );
}

export type ManagerPrintableDayLedgerRow = {
  id: string;
  name: string;
  oldDues: number[];
  paymentToday: number;
  totalDue: number;
  todayDue?: number;
};

export function ManagerPrintableCustomerDayLedgerSheet({
  carryForwardRows,
  date,
  purchasedTodayRows,
}: {
  carryForwardRows: ManagerPrintableDayLedgerRow[];
  date: string;
  purchasedTodayRows: ManagerPrintableDayLedgerRow[];
}): ReactNode {
  const allRows = [
    ...purchasedTodayRows.map((row) => ({ ...row, hasTodayDue: true })),
    ...carryForwardRows.map((row) => ({ ...row, hasTodayDue: false })),
  ];
  const splitIndex = Math.ceil(allRows.length / 2);
  const leftColumn = allRows.slice(0, splitIndex);
  const rightColumn = allRows.slice(splitIndex);
  const pairedRows = Array.from({ length: Math.max(leftColumn.length, rightColumn.length) }, (_, index) => ({
    left: leftColumn[index],
    right: rightColumn[index],
  }));

  const renderDueText = (amounts: number[]) => {
    if (amounts.length === 0) {
      return "—";
    }

    return amounts.slice(0, 2).map((amount) => formatCurrency(amount)).join(" / ");
  };

  const renderEntry = (
    row: (ManagerPrintableDayLedgerRow & { hasTodayDue: boolean }) | undefined,
    index: number,
    side: "left" | "right"
  ) => {
    if (!row) {
      return (
        <>
          <div
            style={{
              borderLeft: side === "right" ? `1px dotted ${tokens.border}` : "none",
              minHeight: 14,
              paddingLeft: side === "right" ? 8 : 0,
            }}
          />
          <div />
          <div />
          <div />
          <div />
        </>
      );
    }

    const serialNo = side === "left" ? index + 1 : splitIndex + index + 1;

    return (
      <>
        <div
          style={{
            borderLeft: side === "right" ? `1px dotted ${tokens.border}` : "none",
            fontSize: 10,
            fontWeight: 700,
            lineHeight: 1.25,
            minWidth: 0,
            paddingLeft: side === "right" ? 8 : 0,
          }}
        >
          <span>{serialNo}. </span>
          <span>{row.name}</span>
        </div>
        <div
          style={{
            borderLeft: `1px dotted ${tokens.border}`,
            fontSize: 10,
            lineHeight: 1.25,
            paddingLeft: 4,
            textAlign: "right",
          }}
        >
          {renderDueText(row.oldDues)}
        </div>
        <div
          style={{
            borderLeft: `1px dotted ${tokens.border}`,
            fontSize: 10,
            lineHeight: 1.25,
            paddingLeft: 4,
            textAlign: "right",
          }}
        >
          {row.hasTodayDue && row.todayDue ? formatCurrency(row.todayDue) : "—"}
        </div>
        <div
          style={{
            borderLeft: `1px dotted ${tokens.border}`,
            color: row.totalDue > 0 ? tokens.danger : tokens.foreground,
            fontSize: 10,
            fontWeight: 700,
            lineHeight: 1.25,
            paddingLeft: 4,
            textAlign: "right",
          }}
        >
          {row.totalDue > 0 ? formatCurrency(row.totalDue) : "—"}
        </div>
        <div
          style={{
            borderLeft: `1px dotted ${tokens.border}`,
            color: row.paymentToday > 0 ? tokens.success : tokens.muted,
            fontSize: 10,
            fontWeight: 700,
            lineHeight: 1.25,
            paddingLeft: 4,
            textAlign: "right",
          }}
        >
          {row.paymentToday > 0 ? formatCurrency(row.paymentToday) : "—"}
        </div>
      </>
    );
  };

  return (
    <div style={{ ...shellStyle, border: "none", borderRadius: 0, boxShadow: "none", gap: 6, maxWidth: "100%", padding: 0 }}>
      <div style={{ color: tokens.muted, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        Customer day ledger • {formatDate(date)}
      </div>
      <div
        style={{
          border: `1px dotted ${tokens.border}`,
          borderRadius: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            ...tableHeaderStyle,
            background: "transparent",
            fontSize: 9,
            gap: 6,
            gridTemplateColumns:
              "minmax(0,1.55fr) 0.88fr 0.68fr 0.8fr 0.78fr minmax(0,1.55fr) 0.88fr 0.68fr 0.8fr 0.78fr",
            padding: "7px 6px",
            borderBottom: `1px dotted ${tokens.border}`,
          }}
        >
          <div>Name</div>
          <div style={{ borderLeft: `1px dotted ${tokens.border}`, paddingLeft: 4, textAlign: "right" }}>Old</div>
          <div style={{ borderLeft: `1px dotted ${tokens.border}`, paddingLeft: 4, textAlign: "right" }}>Today</div>
          <div style={{ borderLeft: `1px dotted ${tokens.border}`, paddingLeft: 4, textAlign: "right" }}>Total</div>
          <div style={{ borderRight: `1px dotted ${tokens.border}`, paddingRight: 8, textAlign: "right" }}>Payment</div>
          <div style={{ paddingLeft: 8 }}>Name</div>
          <div style={{ borderLeft: `1px dotted ${tokens.border}`, paddingLeft: 4, textAlign: "right" }}>Old</div>
          <div style={{ borderLeft: `1px dotted ${tokens.border}`, paddingLeft: 4, textAlign: "right" }}>Today</div>
          <div style={{ borderLeft: `1px dotted ${tokens.border}`, paddingLeft: 4, textAlign: "right" }}>Total</div>
          <div style={{ borderLeft: `1px dotted ${tokens.border}`, paddingLeft: 4, textAlign: "right" }}>Payment</div>
        </div>
        {pairedRows.length === 0 ? (
          <div style={{ color: tokens.muted, fontSize: 12, padding: "12px 10px", textAlign: "center" }}>
            No customer ledger rows for this date.
          </div>
        ) : (
          pairedRows.map(({ left, right }, index) => (
            <div
              key={`${left?.id ?? "empty-left"}-${right?.id ?? "empty-right"}`}
              style={{
                ...tableRowStyle,
                borderTop: index === 0 ? "none" : `1px dotted ${tokens.border}`,
                gap: 6,
                gridTemplateColumns:
                  "minmax(0,1.55fr) 0.88fr 0.68fr 0.8fr 0.78fr minmax(0,1.55fr) 0.88fr 0.68fr 0.8fr 0.78fr",
                padding: "6px",
              }}
            >
              {renderEntry(left, index, "left")}
              {renderEntry(right, index, "right")}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export type ManagerPrintableCustomerDetailRow = {
  amount: number;
  date: string;
  due: number;
  id: string;
  paid: number;
};

export function ManagerPrintableCustomerDetailSheet({
  customerLabel,
  paper = "a4",
  rows,
}: {
  customerLabel: string;
  paper?: "a4" | "thermal";
  rows: ManagerPrintableCustomerDetailRow[];
}): ReactNode {
  const isThermal = paper === "thermal";

  return (
    <div style={{ ...shellStyle, border: "none", boxShadow: "none", gap: 6, maxWidth: "100%", padding: 0 }}>
      <div style={{ display: "grid", gap: 2 }}>
        <div style={{ color: tokens.foreground, fontSize: isThermal ? 15 : 13, fontWeight: 800 }}>
          {customerLabel}
        </div>
        <div style={{ color: tokens.muted, fontSize: isThermal ? 9 : 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Customer ledger detail
        </div>
      </div>
      <div
        style={{
          ...tableShellStyle,
          border: `1px dotted ${tokens.border}`,
          borderRadius: 0,
        }}
      >
        <div
          style={{
            ...tableHeaderStyle,
            borderBottom: `1px dotted ${tokens.border}`,
            fontSize: isThermal ? 8 : 10,
            gridTemplateColumns: "1fr 0.8fr 0.8fr 0.8fr",
            padding: isThermal ? "6px 8px" : "8px 10px",
          }}
        >
          <div>Date</div>
          <div style={{ borderLeft: `1px dotted ${tokens.border}`, paddingLeft: 6, textAlign: "right" }}>Amount</div>
          <div style={{ borderLeft: `1px dotted ${tokens.border}`, paddingLeft: 6, textAlign: "right" }}>Paid</div>
          <div style={{ borderLeft: `1px dotted ${tokens.border}`, paddingLeft: 6, textAlign: "right" }}>Due</div>
        </div>
        {rows.length === 0 ? (
          <div style={{ ...tableRowStyle, gridTemplateColumns: "1fr" }}>
            <div style={{ color: tokens.muted, textAlign: "center" }}>No purchase history for this customer.</div>
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              style={{
                ...tableRowStyle,
                borderTop: `1px dotted ${tokens.border}`,
                gridTemplateColumns: "1fr 0.8fr 0.8fr 0.8fr",
                padding: isThermal ? "6px 8px" : "8px 10px",
              }}
            >
              <div style={{ fontSize: isThermal ? 10 : 12, fontWeight: 700 }}>
                {isThermal
                  ? new Date(`${row.date}T00:00:00`).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  : formatDate(row.date)}
              </div>
              <div style={{ borderLeft: `1px dotted ${tokens.border}`, fontSize: isThermal ? 10 : 12, paddingLeft: 6, textAlign: "right" }}>
                {formatCurrency(row.amount)}
              </div>
              <div style={{ borderLeft: `1px dotted ${tokens.border}`, color: tokens.success, fontSize: isThermal ? 10 : 12, fontWeight: 700, paddingLeft: 6, textAlign: "right" }}>
                {formatCurrency(row.paid)}
              </div>
              <div style={{ borderLeft: `1px dotted ${tokens.border}`, color: tokens.danger, fontSize: isThermal ? 10 : 12, fontWeight: 700, paddingLeft: 6, textAlign: "right" }}>
                {formatCurrency(row.due)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
