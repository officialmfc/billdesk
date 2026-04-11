import type { ReactElement, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { PaymentMethod, SelectionOption } from "../../shared/contracts";

type DesktopMessage = { tone: "error" | "success" | "warning"; text: string } | null;

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "upi", label: "UPI" },
  { value: "check", label: "Check" },
];

function getCurrentDateIST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function filterOptions(options: SelectionOption[], query: string): SelectionOption[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return options.slice(0, 12);
  }

  return [...options]
    .sort((left, right) => {
      const leftText = `${left.label} ${left.description ?? ""} ${left.meta ?? ""}`.toLowerCase();
      const rightText = `${right.label} ${right.description ?? ""} ${right.meta ?? ""}`.toLowerCase();
      const leftStarts = leftText.startsWith(normalized) ? 0 : 1;
      const rightStarts = rightText.startsWith(normalized) ? 0 : 1;
      const leftIncludes = leftText.includes(normalized) ? 0 : 1;
      const rightIncludes = rightText.includes(normalized) ? 0 : 1;
      return leftStarts - rightStarts || leftIncludes - rightIncludes || left.label.localeCompare(right.label);
    })
    .filter((option) => {
      const text = `${option.label} ${option.description ?? ""} ${option.meta ?? ""}`.toLowerCase();
      return text.includes(normalized);
    })
    .slice(0, 12);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function parseDue(value?: string | null): number {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

function DialogShell({
  children,
  description,
  onClose,
  open,
  title,
}: {
  children: ReactNode;
  description: string;
  onClose: () => void;
  open: boolean;
  title: string;
}): ReactElement | null {
  if (!open) {
    return null;
  }

  return (
    <div
      className="desktop-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="desktop-modal-card">
        <div className="desktop-modal-header">
          <div>
            <h2 className="desktop-modal-title">{title}</h2>
            <p className="desktop-modal-description">{description}</p>
          </div>
          <button className="ghost-button" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <div className="desktop-modal-body">{children}</div>
      </div>
    </div>
  );
}

function AutocompleteInput({
  autoFocus = false,
  disabled,
  label,
  onSelect,
  options,
  placeholder,
  selectedId,
}: {
  autoFocus?: boolean;
  disabled?: boolean;
  label: string;
  onSelect: (option: SelectionOption) => void;
  options: SelectionOption[];
  placeholder: string;
  selectedId: string;
}): ReactElement {
  const selected = options.find((option) => option.value === selectedId) ?? null;
  const [query, setQuery] = useState(selected?.label ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const blurTimeoutRef = useRef<number | null>(null);
  const optionRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  useEffect(() => {
    setQuery(selected?.label ?? "");
  }, [selected?.label]);

  const filtered = useMemo(() => filterOptions(options, query), [options, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const commitSelection = (option: SelectionOption) => {
    setQuery(option.label);
    setOpen(false);
    onSelect(option);
  };

  return (
    <div className="field-block autocomplete">
      <label className="field-label">{label}</label>
      <div className="field-input-wrap">
        <input
          autoFocus={autoFocus}
          className="text-input"
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimeoutRef.current = window.setTimeout(() => {
              setOpen(false);
              setQuery(selected?.label ?? "");
            }, 120);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) => Math.min(current + 1, Math.max(filtered.length - 1, 0)));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) => Math.max(current - 1, 0));
            } else if (event.key === "Enter" && open && filtered[activeIndex]) {
              event.preventDefault();
              commitSelection(filtered[activeIndex]!);
            } else if (event.key === "Escape") {
              setOpen(false);
              setQuery(selected?.label ?? "");
            }
          }}
        />
        {query ? (
          <button
            className="input-clear-button"
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              setQuery("");
              setOpen(true);
            }}
            onClick={() => {
              setQuery("");
              setOpen(true);
            }}
          >
            ×
          </button>
        ) : null}
      </div>
      {open && filtered.length > 0 ? (
        <div className="autocomplete-panel">
          {filtered.map((option, index) => (
            <button
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              className={`autocomplete-option ${index === activeIndex ? "active" : ""}`}
              onMouseDown={(event) => {
                event.preventDefault();
                if (blurTimeoutRef.current) {
                  window.clearTimeout(blurTimeoutRef.current);
                }
                commitSelection(option);
              }}
            >
              <span>{option.label}</span>
              {option.description || option.meta ? (
                <span className="autocomplete-meta">
                  {[option.description, option.meta].filter(Boolean).join(" • ")}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TextField({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  value: string;
}): ReactElement {
  return (
    <div className="field-block">
      <label className="field-label">{label}</label>
      <input
        className="text-input"
        inputMode={type === "number" ? "decimal" : undefined}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function SelectField({
  hint,
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  hint?: string | null;
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  value: string;
}): ReactElement {
  return (
    <div className="field-block">
      <label className="field-label">{label}</label>
      <select className="text-input" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder ?? `Select ${label.toLowerCase()}`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <div className="field-helper">{hint}</div> : null}
    </div>
  );
}

export function DesktopCustomerPaymentDialog({
  accountOptions,
  onMessage,
  onSuccess,
  presetCustomerId,
  presetCustomerName,
  presetPaymentDate,
  triggerLabel,
  triggerVariant = "secondary",
}: {
  accountOptions: SelectionOption[];
  onMessage: (message: DesktopMessage) => void;
  onSuccess?: () => Promise<void> | void;
  presetCustomerId?: string;
  presetCustomerName?: string;
  presetPaymentDate?: string;
  triggerLabel: string;
  triggerVariant?: "primary" | "secondary";
}): ReactElement {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingBills, setLoadingBills] = useState(false);
  const [mode, setMode] = useState<"specific" | "lump">("lump");
  const [customerId, setCustomerId] = useState(presetCustomerId ?? "");
  const [billId, setBillId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentDate, setPaymentDate] = useState(presetPaymentDate ?? getCurrentDateIST());
  const [billOptions, setBillOptions] = useState<SelectionOption[]>([]);

  const selectedCustomer = accountOptions.find((option) => option.value === customerId);
  const selectedBill = billOptions.find((option) => option.value === billId);
  const customerDue = parseDue(selectedCustomer?.meta);
  const selectedBillDue = parseDue(selectedBill?.meta);

  useEffect(() => {
    if (!open) {
      return;
    }

    setMode(presetCustomerId ? "specific" : "lump");
    setCustomerId(presetCustomerId ?? "");
    setBillId("");
    setAmount("");
    setPaymentMethod("cash");
    setPaymentDate(presetPaymentDate ?? getCurrentDateIST());
  }, [open, presetCustomerId, presetPaymentDate]);

  useEffect(() => {
    if (!open || !customerId) {
      setBillOptions([]);
      return;
    }

    let cancelled = false;
    setLoadingBills(true);
    void window.managerDesktopApi.payments
      .getCustomerBillOptions(customerId)
      .then((options) => {
        if (!cancelled) {
          setBillOptions(options);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          onMessage({
            tone: "error",
            text: error instanceof Error ? error.message : "Could not load bill options.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingBills(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [customerId, onMessage, open]);

  useEffect(() => {
    if (mode === "specific" && selectedBill) {
      setAmount(String(selectedBillDue || ""));
    }
  }, [mode, selectedBill, selectedBillDue]);

  const closeDialog = () => {
    setOpen(false);
    setBillId("");
    setAmount("");
    setBillOptions([]);
  };

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);
    if (!customerId) {
      onMessage({ tone: "error", text: "Select a customer account first." });
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      onMessage({ tone: "error", text: "Enter a valid payment amount." });
      return;
    }
    if (mode === "specific") {
      if (!billId) {
        onMessage({ tone: "error", text: "Choose a bill before recording payment." });
        return;
      }
      if (parsedAmount > selectedBillDue) {
        onMessage({
          tone: "error",
          text: `The selected bill only has ${formatCurrency(selectedBillDue)} due.`,
        });
        return;
      }
    } else if (customerDue > 0 && parsedAmount > customerDue) {
      onMessage({
        tone: "error",
        text: `This customer only has ${formatCurrency(customerDue)} due in total.`,
      });
      return;
    }

    try {
      setSubmitting(true);
      if (mode === "specific") {
        await window.managerDesktopApi.payments.submitSpecificBillPayment({
          amount: parsedAmount,
          billId,
          paymentDate,
          paymentMethod,
        });
      } else {
        await window.managerDesktopApi.payments.submitLumpSumPayment({
          amount: parsedAmount,
          customerId,
          paymentDate,
          paymentMethod,
        });
      }
      await Promise.resolve(onSuccess?.());
      onMessage({
        tone: "success",
        text: `${formatCurrency(parsedAmount)} customer payment recorded.`,
      });
      closeDialog();
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not record customer payment.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const triggerClassName = triggerVariant === "primary" ? "primary-button" : "secondary-button";

  return (
    <>
      <button
        className={triggerClassName}
        style={{ padding: "10px 14px" }}
        type="button"
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </button>
      <DialogShell
        description="Use single-bill or lump-sum collection, then refresh the read model from PowerSync."
        onClose={closeDialog}
        open={open}
        title="Customer Payment"
      >
        <div className="dialog-segment-row">
          <button
            className={mode === "specific" ? "primary-button" : "secondary-button"}
            type="button"
            onClick={() => setMode("specific")}
          >
            Single bill
          </button>
          <button
            className={mode === "lump" ? "primary-button" : "secondary-button"}
            type="button"
            onClick={() => setMode("lump")}
          >
            Lump sum
          </button>
        </div>

        <AutocompleteInput
          autoFocus={!presetCustomerId}
          label="Customer"
          options={
            presetCustomerId && presetCustomerName
              ? [{ value: presetCustomerId, label: presetCustomerName }, ...accountOptions]
              : accountOptions
          }
          placeholder="Search customer..."
          selectedId={customerId}
          onSelect={(option) => {
            setCustomerId(option.value);
            setBillId("");
            setAmount("");
          }}
        />

        {mode === "specific" ? (
          <SelectField
            label="Bill"
            placeholder={loadingBills ? "Loading bills..." : "Select bill"}
            options={billOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            value={billId}
            onChange={setBillId}
            hint={
              selectedBill
                ? `${selectedBill.description ?? ""} • Due ${formatCurrency(selectedBillDue)}`
                : null
            }
          />
        ) : null}

        <div className="field-grid">
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={setAmount}
            placeholder="0.00"
          />
          <SelectField
            label="Method"
            options={PAYMENT_METHODS}
            value={paymentMethod}
            onChange={(value) => setPaymentMethod(value as PaymentMethod)}
          />
        </div>

        <TextField
          label="Payment Date"
          value={paymentDate}
          onChange={setPaymentDate}
          placeholder="YYYY-MM-DD"
        />

        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={closeDialog}>
            Cancel
          </button>
          <button className="primary-button" type="button" disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? "Saving..." : "Submit payment"}
          </button>
        </div>
      </DialogShell>
    </>
  );
}

export function DesktopSellerPayoutDialog({
  onMessage,
  onSuccess,
  presetPaymentDate,
  presetSellerId,
  presetSellerName,
  sellerOptions,
  triggerLabel,
  triggerVariant = "secondary",
}: {
  onMessage: (message: DesktopMessage) => void;
  onSuccess?: () => Promise<void> | void;
  presetPaymentDate?: string;
  presetSellerId?: string;
  presetSellerName?: string;
  sellerOptions: SelectionOption[];
  triggerLabel: string;
  triggerVariant?: "primary" | "secondary";
}): ReactElement {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingChalans, setLoadingChalans] = useState(false);
  const [sellerId, setSellerId] = useState(presetSellerId ?? "");
  const [chalanId, setChalanId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [paymentDate, setPaymentDate] = useState(presetPaymentDate ?? getCurrentDateIST());
  const [chalanOptions, setChalanOptions] = useState<SelectionOption[]>([]);

  const selectedChalan = chalanOptions.find((option) => option.value === chalanId);
  const selectedChalanDue = parseDue(selectedChalan?.meta);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSellerId(presetSellerId ?? "");
    setChalanId("");
    setAmount("");
    setPaymentMethod("bank_transfer");
    setPaymentDate(presetPaymentDate ?? getCurrentDateIST());
  }, [open, presetPaymentDate, presetSellerId]);

  useEffect(() => {
    if (!open || !sellerId) {
      setChalanOptions([]);
      return;
    }

    let cancelled = false;
    setLoadingChalans(true);
    void window.managerDesktopApi.payments
      .getSellerChalanOptions(sellerId)
      .then((options) => {
        if (!cancelled) {
          setChalanOptions(options);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          onMessage({
            tone: "error",
            text: error instanceof Error ? error.message : "Could not load chalan options.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingChalans(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [onMessage, open, sellerId]);

  useEffect(() => {
    if (selectedChalan) {
      setAmount(String(selectedChalanDue || ""));
    }
  }, [selectedChalan, selectedChalanDue]);

  const closeDialog = () => {
    setOpen(false);
    setChalanId("");
    setAmount("");
    setChalanOptions([]);
  };

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);
    if (!sellerId) {
      onMessage({ tone: "error", text: "Select a seller account first." });
      return;
    }
    if (!chalanId) {
      onMessage({ tone: "error", text: "Choose a chalan before recording payout." });
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      onMessage({ tone: "error", text: "Enter a valid payout amount." });
      return;
    }
    if (parsedAmount > selectedChalanDue) {
      onMessage({
        tone: "error",
        text: `The selected chalan only has ${formatCurrency(selectedChalanDue)} pending.`,
      });
      return;
    }

    try {
      setSubmitting(true);
      await window.managerDesktopApi.payments.submitSellerPayout({
        amount: parsedAmount,
        chalanId,
        paymentDate,
        paymentMethod,
      });
      await Promise.resolve(onSuccess?.());
      onMessage({
        tone: "success",
        text: `${formatCurrency(parsedAmount)} seller payout recorded.`,
      });
      closeDialog();
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not record seller payout.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const triggerClassName = triggerVariant === "primary" ? "primary-button" : "secondary-button";

  return (
    <>
      <button
        className={triggerClassName}
        style={{ padding: "10px 14px" }}
        type="button"
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </button>
      <DialogShell
        description="Choose the pending chalan and record the payout directly against Supabase."
        onClose={closeDialog}
        open={open}
        title="Seller Payout"
      >
        <AutocompleteInput
          autoFocus={!presetSellerId}
          label="Seller"
          options={
            presetSellerId && presetSellerName
              ? [{ value: presetSellerId, label: presetSellerName }, ...sellerOptions]
              : sellerOptions
          }
          placeholder="Search seller..."
          selectedId={sellerId}
          onSelect={(option) => {
            setSellerId(option.value);
            setChalanId("");
            setAmount("");
          }}
        />

        <SelectField
          label="Chalan"
          placeholder={loadingChalans ? "Loading chalans..." : "Select chalan"}
          options={chalanOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          value={chalanId}
          onChange={setChalanId}
          hint={
            selectedChalan
              ? `${selectedChalan.description ?? ""} • Due ${formatCurrency(selectedChalanDue)}`
              : null
          }
        />

        <div className="field-grid">
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={setAmount}
            placeholder="0.00"
          />
          <SelectField
            label="Method"
            options={PAYMENT_METHODS}
            value={paymentMethod}
            onChange={(value) => setPaymentMethod(value as PaymentMethod)}
          />
        </div>

        <TextField
          label="Payment Date"
          value={paymentDate}
          onChange={setPaymentDate}
          placeholder="YYYY-MM-DD"
        />

        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={closeDialog}>
            Cancel
          </button>
          <button className="primary-button" type="button" disabled={submitting} onClick={() => void handleSubmit()}>
            {submitting ? "Saving..." : "Submit payout"}
          </button>
        </div>
      </DialogShell>
    </>
  );
}
