import type { ReactElement, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  buildManagerQuoteNumber,
  calculateManagerQuoteTotal,
  type ManagerInlineCustomerDraft,
  type ManagerInlineProductDraft,
  type ManagerQuoteItemDraft,
} from "@mfc/manager-workflows";
import {
  Copy,
  Loader2,
  PackagePlus,
  Plus,
  Save,
  Search,
  Settings2,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import type {
  DesktopProductCreateInput,
  DesktopProductRecord,
  DesktopQuoteCreateInput,
  DesktopQuoteRecord,
  DesktopPendingRegistration,
  DesktopStockBatchCreateInput,
  DesktopStockOverview,
  DesktopUserCreateInput,
  DesktopUserInvitationResult,
  DesktopUserRecord,
  SelectionOption,
  StaffProfile,
  SyncStatus,
} from "../../shared/contracts";
import {
  DESKTOP_LANDING_OPTIONS,
  getDesktopLandingPreference,
  setDesktopLandingPreference,
} from "./desktop-preferences";
import type { DesktopLocalSecuritySnapshot } from "./local-security";
import { DesktopLocalSecuritySettings } from "./local-security-ui";

type MessageHandler = (message: { tone: "error" | "success" | "warning"; text: string } | null) => void;

type StatusTone = "success" | "warning" | "danger" | "muted";

type ProductDraft = DesktopProductCreateInput & { id: string };
type StockDraft = DesktopStockBatchCreateInput & { id: string };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCurrentDateIST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function normalize(text: string | null | undefined): string {
  return (text ?? "").trim().toLowerCase();
}

function filterOptions(options: SelectionOption[], query: string): SelectionOption[] {
  const term = normalize(query);

  if (!term) {
    return options.slice(0, 12);
  }

  return [...options]
    .filter((option) => {
      const text = `${option.label} ${option.description ?? ""} ${option.meta ?? ""}`.toLowerCase();
      return text.includes(term);
    })
    .sort((left, right) => {
      const leftText = `${left.label} ${left.description ?? ""} ${left.meta ?? ""}`.toLowerCase();
      const rightText = `${right.label} ${right.description ?? ""} ${right.meta ?? ""}`.toLowerCase();
      const leftStarts = leftText.startsWith(term) ? 0 : 1;
      const rightStarts = rightText.startsWith(term) ? 0 : 1;
      return leftStarts - rightStarts || left.label.localeCompare(right.label);
    })
    .slice(0, 12);
}

function toUserOption(user: DesktopUserRecord): SelectionOption {
  const businessName = user.businessName?.trim() ?? "";
  const name = user.name.trim();

  return {
    value: user.id,
    label:
      businessName && businessName !== name ? `${businessName} (${name})` : businessName || name,
    meta: user.phone,
  };
}

function createQuoteItem(): ManagerQuoteItemDraft {
  return {
    id: crypto.randomUUID(),
    productId: "",
    productDescription: "",
    weightKg: "",
    pricePerKg: "",
  };
}

function createProductDraft(): ProductDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    isStockTracked: true,
  };
}

function createStockDraft(): StockDraft {
  return {
    id: crypto.randomUUID(),
    productId: null,
    productName: "",
    mfcSellerId: "",
    supplierId: null,
    initialWeightKg: 0,
    costPerKg: null,
  };
}

function getStatusTone(status: string): StatusTone {
  switch (status) {
    case "paid":
    case "confirmed":
    case "delivered":
    case "available":
      return "success";
    case "due":
    case "pending":
    case "low":
    case "partially_paid":
      return "warning";
    case "cancelled":
    case "empty":
      return "danger";
    default:
      return "muted";
  }
}

function StatusChip({ label, tone }: { label: string; tone: StatusTone }): ReactElement {
  return <span className={`admin-status-chip ${tone}`}>{label}</span>;
}

function DesktopModal({
  children,
  description,
  onClose,
  title,
  width = 720,
}: {
  children: ReactNode;
  description?: string;
  onClose: () => void;
  title: string;
  width?: number;
}): ReactElement {
  return (
    <div className="desktop-modal-overlay" onMouseDown={onClose}>
      <div
        className="desktop-modal-card"
        onMouseDown={(event) => event.stopPropagation()}
        style={{ width: `min(${width}px, 100%)` }}
      >
        <div className="desktop-modal-header">
          <div>
            <h2 className="desktop-modal-title">{title}</h2>
            {description ? <p className="desktop-modal-description">{description}</p> : null}
          </div>
          <button className="ghost-button icon-button" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <div className="desktop-modal-body">{children}</div>
      </div>
    </div>
  );
}

function AutocompleteField({
  createAction,
  disabled,
  emptyLabel,
  label,
  onChange,
  onSelect,
  options,
  placeholder,
  value,
}: {
  createAction?: ReactNode;
  disabled?: boolean;
  emptyLabel?: string;
  label: string;
  onChange: (nextValue: string) => void;
  onSelect: (option: SelectionOption) => void;
  options: SelectionOption[];
  placeholder: string;
  value: string;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => filterOptions(options, value), [options, value]);
  const hasExactMatch = useMemo(
    () => options.some((option) => normalize(option.label) === normalize(value)),
    [options, value]
  );

  return (
    <div className="field-block autocomplete">
      <label className="field-label">{label}</label>
      <div className="field-input-wrap">
        <input
          className="text-input compact"
          disabled={disabled}
          onBlur={() => window.setTimeout(() => setOpen(false), 160)}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          value={value}
        />
        {value ? (
          <button
            className="input-clear-button"
            disabled={disabled}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            type="button"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>
      {open ? (
        filtered.length > 0 ? (
          <div className="autocomplete-panel">
            {filtered.map((option) => (
              <button
                key={option.value}
                className="autocomplete-option"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelect(option);
                  setOpen(false);
                }}
                type="button"
              >
                <span>{option.label}</span>
                {option.meta ? <span className="autocomplete-meta">{option.meta}</span> : null}
              </button>
            ))}
            {createAction && value.trim() && !hasExactMatch ? (
              <div className="autocomplete-empty">{createAction}</div>
            ) : null}
          </div>
        ) : value.trim() ? (
          <div className="autocomplete-panel">
            <div className="autocomplete-empty">
              <div className="field-helper">{emptyLabel ?? "No matching result"}</div>
              {createAction}
            </div>
          </div>
        ) : null
      ) : null}
    </div>
  );
}

function PageLoading({ label }: { label: string }): ReactElement {
  return (
    <div className="content-card">
      <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
        <span className="inline-spinner" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function DesktopQuotesPage({
  onDataChanged,
  onMessage,
}: {
  onDataChanged: () => Promise<void>;
  onMessage: MessageHandler;
}): ReactElement {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [quotes, setQuotes] = useState<DesktopQuoteRecord[]>([]);
  const [customers, setCustomers] = useState<DesktopUserRecord[]>([]);
  const [sellers, setSellers] = useState<SelectionOption[]>([]);
  const [products, setProducts] = useState<DesktopProductRecord[]>([]);
  const [customerInput, setCustomerInput] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(getCurrentDateIST());
  const [quoteNumber, setQuoteNumber] = useState(buildManagerQuoteNumber());
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ManagerQuoteItemDraft[]>([createQuoteItem()]);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [activeProductRowId, setActiveProductRowId] = useState<string | null>(null);
  const [customerDraft, setCustomerDraft] = useState<ManagerInlineCustomerDraft>({
    businessName: "",
    fullName: "",
    phone: "",
  });
  const [productDraft, setProductDraft] = useState<ManagerInlineProductDraft>({
    name: "",
    description: "",
  });

  const loadOverview = async () => {
    setLoading(true);
    try {
      const overview = await window.managerDesktopApi.quotes.getOverview();
      setQuotes(overview.quotes);
      setCustomers(overview.customers);
      setSellers(overview.sellers);
      setProducts(overview.products);
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not load quotes.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const customerOptions = useMemo(
    () => customers.filter((user) => user.isActive).map(toUserOption),
    [customers]
  );
  const productOptions = useMemo<SelectionOption[]>(
    () =>
      products.map((product) => ({
        value: product.id,
        label: product.name,
        description: product.description,
      })),
    [products]
  );

  const filteredQuotes = useMemo(() => {
    const term = normalize(search);
    if (!term) {
      return quotes;
    }

    return quotes.filter((quote) =>
      [quote.quoteNumber, quote.customerName, quote.sellerName, quote.status]
        .filter(Boolean)
        .some((value) => normalize(String(value)).includes(term))
    );
  }, [quotes, search]);

  const totalAmount = useMemo(() => calculateManagerQuoteTotal(items), [items]);

  const resetForm = () => {
    setCustomerInput("");
    setCustomerId("");
    setSellerId("");
    setDeliveryDate(getCurrentDateIST());
    setQuoteNumber(buildManagerQuoteNumber());
    setNotes("");
    setItems([createQuoteItem()]);
    setCreateCustomerOpen(false);
    setCreateProductOpen(false);
    setActiveProductRowId(null);
    setCustomerDraft({ businessName: "", fullName: "", phone: "" });
    setProductDraft({ name: "", description: "" });
  };

  const updateItem = (itemId: string, patch: Partial<ManagerQuoteItemDraft>) => {
    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
  };

  const handleSubmit = async () => {
    const validItems = items.filter(
      (item) =>
        (item.productDescription ?? "").trim() &&
        Number(item.weightKg) > 0 &&
        Number(item.pricePerKg) > 0
    );

    if (!customerId) {
      onMessage({ tone: "error", text: "Select the customer for this quote." });
      return;
    }

    if (!sellerId) {
      onMessage({ tone: "error", text: "Select the assigned MFC seller." });
      return;
    }

    if (!validItems.length) {
      onMessage({ tone: "error", text: "Add at least one valid quote line." });
      return;
    }

    setSaving(true);
    onMessage(null);

    try {
      const payload: DesktopQuoteCreateInput = {
        customerId,
        assignedMfcSellerId: sellerId,
        deliveryDate,
        quoteNumber,
        notes,
        items: validItems.map((item) => ({
          productId: item.productId || null,
          productDescription: item.productDescription ?? "",
          weightKg: Number(item.weightKg),
          pricePerKg: Number(item.pricePerKg),
        })),
      };
      const createdNumber = await window.managerDesktopApi.quotes.create(payload);
      await Promise.all([loadOverview(), onDataChanged()]);
      setCreateOpen(false);
      resetForm();
      onMessage({
        tone: "success",
        text: `Quote ${createdNumber} created successfully.`,
      });
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not create quote.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (customerDraft.businessName.trim().length < 2) {
      onMessage({ tone: "error", text: "Business name must be at least 2 characters." });
      return;
    }

    if (customerDraft.fullName.trim().length < 2) {
      onMessage({ tone: "error", text: "Contact name must be at least 2 characters." });
      return;
    }

    if (customerDraft.phone.trim().length < 10) {
      onMessage({ tone: "error", text: "Phone number must be at least 10 digits." });
      return;
    }

    setSaving(true);
    try {
      const createdUser = await window.managerDesktopApi.users.create({
        authMode: "without_auth",
        fullName: customerDraft.fullName,
        businessName: customerDraft.businessName,
        phone: customerDraft.phone,
        userType: "business",
        defaultRole: "buyer",
      });
      setCustomers((current) => [createdUser, ...current]);
      setCustomerId(createdUser.id);
      setCustomerInput(createdUser.businessName || createdUser.name);
      setCreateCustomerOpen(false);
      await onDataChanged();
      onMessage({ tone: "success", text: "Customer created successfully." });
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not create customer.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProduct = async () => {
    if (productDraft.name.trim().length < 2) {
      onMessage({ tone: "error", text: "Product name must be at least 2 characters." });
      return;
    }

    setSaving(true);
    try {
      const [createdProduct] = await window.managerDesktopApi.products.create([
        {
          name: productDraft.name,
          description: productDraft.description,
          isStockTracked: true,
        },
      ]);

      if (!createdProduct) {
        throw new Error("No product was created.");
      }

      setProducts((current) => [createdProduct, ...current]);
      if (activeProductRowId) {
        updateItem(activeProductRowId, {
          productId: createdProduct.id,
          productDescription: createdProduct.name,
        });
      }
      setCreateProductOpen(false);
      setActiveProductRowId(null);
      await onDataChanged();
      onMessage({ tone: "success", text: "Product created successfully." });
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not create product.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoading label="Loading quotes..." />;
  }

  return (
    <>
      <div className="content-card">
        <div className="page-header">
          <div>
            <h1 className="page-title">Quotes</h1>
            <p className="page-subtitle">Pending and confirmed customer quote requests.</p>
          </div>
          <div className="header-actions">
            <div className="admin-search">
              <Search size={16} />
              <input
                className="text-input compact"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search quotes..."
                value={search}
              />
            </div>
            <button className="primary-button" onClick={() => setCreateOpen(true)} type="button">
              <Plus size={16} />
              Create Quote
            </button>
          </div>
        </div>

        <div className="ledger-table-wrap" style={{ marginTop: 18 }}>
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Customer</th>
                <th>Seller</th>
                <th>Delivery</th>
                <th className="align-right">Total</th>
                <th className="align-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.length ? (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id}>
                    <td className="cell-strong">{quote.quoteNumber}</td>
                    <td>{quote.customerName}</td>
                    <td>{quote.sellerName || "Unassigned"}</td>
                    <td>{formatDate(quote.deliveryDate)}</td>
                    <td className="align-right cell-strong">{formatCurrency(quote.totalAmount)}</td>
                    <td className="align-center">
                      <StatusChip label={quote.status} tone={getStatusTone(quote.status)} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="ledger-empty-row" colSpan={6}>
                    No quotes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {createOpen ? (
        <DesktopModal
          description="Search customers, assign a seller, and prepare quote line items without leaving desktop."
          onClose={() => {
            setCreateOpen(false);
            resetForm();
          }}
          title="Create Quote"
          width={980}
        >
          <div className="field-grid">
            <div className="field-block">
              <label className="field-label">Quote Number</label>
              <input
                className="text-input compact"
                onChange={(event) => setQuoteNumber(event.target.value)}
                value={quoteNumber}
              />
            </div>
            <div className="field-block">
              <label className="field-label">Delivery Date</label>
              <input
                className="text-input compact"
                onChange={(event) => setDeliveryDate(event.target.value)}
                type="date"
                value={deliveryDate}
              />
            </div>
          </div>

          <div className="field-grid">
            <AutocompleteField
              createAction={
                <button
                  className="secondary-button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setCustomerDraft((current) => ({
                      businessName: customerInput.trim() || current.businessName,
                      fullName: customerInput.trim() || current.fullName,
                      phone: current.phone,
                    }));
                    setCreateCustomerOpen(true);
                  }}
                  type="button"
                >
                  Create customer
                </button>
              }
              emptyLabel="No matching customer"
              label="Customer"
              onChange={(nextValue) => {
                setCustomerInput(nextValue);
                setCustomerId("");
              }}
              onSelect={(option) => {
                setCustomerInput(option.label);
                setCustomerId(option.value);
                setCreateCustomerOpen(false);
              }}
              options={customerOptions}
              placeholder="Search and select customer..."
              value={customerInput}
            />

            <div className="field-block">
              <label className="field-label">MFC Seller</label>
              <select
                className="text-input compact"
                onChange={(event) => setSellerId(event.target.value)}
                value={sellerId}
              >
                <option value="">Select seller</option>
                {sellers.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {createCustomerOpen ? (
            <div className="inline-create-card">
              <div className="section-heading">
                <div>
                  <h3>Create Customer Without Login</h3>
                  <p>Keep the quote open and add a buyer account directly.</p>
                </div>
                <button className="ghost-button" onClick={() => setCreateCustomerOpen(false)} type="button">
                  Close
                </button>
              </div>
              <div className="field-grid">
                <div className="field-block">
                  <label className="field-label">Business Name</label>
                  <input
                    className="text-input compact"
                    onChange={(event) =>
                      setCustomerDraft((current) => ({ ...current, businessName: event.target.value }))
                    }
                    value={customerDraft.businessName}
                  />
                </div>
                <div className="field-block">
                  <label className="field-label">Contact Name</label>
                  <input
                    className="text-input compact"
                    onChange={(event) =>
                      setCustomerDraft((current) => ({ ...current, fullName: event.target.value }))
                    }
                    value={customerDraft.fullName}
                  />
                </div>
                <div className="field-block">
                  <label className="field-label">Phone</label>
                  <input
                    className="text-input compact"
                    onChange={(event) =>
                      setCustomerDraft((current) => ({ ...current, phone: event.target.value }))
                    }
                    value={customerDraft.phone}
                  />
                </div>
              </div>
              <div className="dialog-actions">
                <button className="primary-button" disabled={saving} onClick={() => void handleCreateCustomer()} type="button">
                  {saving ? "Creating..." : "Create Customer"}
                </button>
              </div>
            </div>
          ) : null}

          <div className="section-heading">
            <div>
              <h3>Quote Items</h3>
              <p>Search products, type a description, or create a new product inline.</p>
            </div>
            <button
              className="secondary-button"
              onClick={() => setItems((current) => [...current, createQuoteItem()])}
              type="button"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          <div className="admin-line-stack">
            {items.map((item, index) => (
              <div className="admin-line-card" key={item.id}>
                <div className="admin-line-head">
                  <span className="line-badge">#{index + 1}</span>
                  {items.length > 1 ? (
                    <button
                      className="ghost-button icon-button"
                      onClick={() =>
                        setItems((current) => current.filter((entry) => entry.id !== item.id))
                      }
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
                <div className="admin-quote-row">
                  <AutocompleteField
                    createAction={
                      <button
                        className="secondary-button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          setProductDraft({
                            name: (item.productDescription ?? "").trim(),
                            description: "",
                          });
                          setActiveProductRowId(item.id);
                          setCreateProductOpen(true);
                        }}
                        type="button"
                      >
                        Create product
                      </button>
                    }
                    emptyLabel="No matching product"
                    label="Product"
                    onChange={(nextValue) =>
                      updateItem(item.id, { productId: "", productDescription: nextValue })
                    }
                    onSelect={(option) =>
                      updateItem(item.id, {
                        productId: option.value,
                        productDescription: option.label,
                      })
                    }
                    options={productOptions}
                    placeholder="Search or create product..."
                    value={item.productDescription ?? ""}
                  />
                  <div className="field-block">
                    <label className="field-label">Description</label>
                    <input
                      className="text-input compact"
                      onChange={(event) =>
                        updateItem(item.id, { productDescription: event.target.value })
                      }
                      value={item.productDescription ?? ""}
                    />
                  </div>
                  <div className="field-block">
                    <label className="field-label">Weight (kg)</label>
                    <input
                      className="text-input compact"
                      inputMode="decimal"
                      onChange={(event) => updateItem(item.id, { weightKg: event.target.value })}
                      type="number"
                      value={String(item.weightKg ?? "")}
                    />
                  </div>
                  <div className="field-block">
                    <label className="field-label">Price/kg</label>
                    <input
                      className="text-input compact"
                      inputMode="decimal"
                      onChange={(event) => updateItem(item.id, { pricePerKg: event.target.value })}
                      type="number"
                      value={String(item.pricePerKg ?? "")}
                    />
                  </div>
                  <div className="admin-inline-amount">{formatCurrency(Number(item.weightKg || 0) * Number(item.pricePerKg || 0))}</div>
                </div>
              </div>
            ))}
          </div>

          {createProductOpen ? (
            <div className="inline-create-card">
              <div className="section-heading">
                <div>
                  <h3>Create Product</h3>
                  <p>Add a product and keep the quote flow open.</p>
                </div>
                <button className="ghost-button" onClick={() => setCreateProductOpen(false)} type="button">
                  Close
                </button>
              </div>
              <div className="field-grid">
                <div className="field-block">
                  <label className="field-label">Product Name</label>
                  <input
                    className="text-input compact"
                    onChange={(event) =>
                      setProductDraft((current) => ({ ...current, name: event.target.value }))
                    }
                    value={productDraft.name}
                  />
                </div>
                <div className="field-block">
                  <label className="field-label">Description</label>
                  <input
                    className="text-input compact"
                    onChange={(event) =>
                      setProductDraft((current) => ({ ...current, description: event.target.value }))
                    }
                    value={productDraft.description}
                  />
                </div>
              </div>
              <div className="dialog-actions">
                <button className="primary-button" disabled={saving} onClick={() => void handleCreateProduct()} type="button">
                  {saving ? "Creating..." : "Create Product"}
                </button>
              </div>
            </div>
          ) : null}

          <div className="field-block">
            <label className="field-label">Notes</label>
            <textarea
              className="text-input admin-textarea"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Additional notes..."
              value={notes}
            />
          </div>

          <div className="summary-row">
            <span>Total Amount</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>

          <div className="dialog-actions">
            <button
              className="secondary-button"
              onClick={() => {
                setCreateOpen(false);
                resetForm();
              }}
              type="button"
            >
              Cancel
            </button>
            <button className="primary-button" disabled={saving} onClick={() => void handleSubmit()} type="button">
              {saving ? (
                <>
                  <Loader2 className="spin-icon" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create Quote
                </>
              )}
            </button>
          </div>
        </DesktopModal>
      ) : null}
    </>
  );
}

export function DesktopUsersPage({
  onDataChanged,
  onMessage,
}: {
  onDataChanged: () => Promise<void>;
  onMessage: MessageHandler;
}): ReactElement {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteTarget, setInviteTarget] = useState<DesktopUserRecord | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<DesktopUserRecord[]>([]);
  const [pendingInvites, setPendingInvites] = useState<DesktopPendingRegistration[]>([]);
  const [draft, setDraft] = useState<DesktopUserCreateInput>({
    authMode: "with_invite",
    email: "",
    fullName: "",
    businessName: "",
    phone: "",
    userType: "business",
    defaultRole: "buyer",
  });
  const [invitePlatform, setInvitePlatform] = useState<"web" | "desktop" | "mobile">("mobile");
  const [inviteResult, setInviteResult] = useState<DesktopUserInvitationResult | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      setUsers(await window.managerDesktopApi.users.list());
      setPendingInvites(await window.managerDesktopApi.users.listInvites());
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not load users.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const pendingInviteIds = useMemo(
    () =>
      new Set(
        pendingInvites
          .filter((row) => row.status === "invited" || row.status === "opened" || row.status === "approved_activation")
          .map((row) => row.supabaseRecordId)
          .filter((value): value is string => Boolean(value))
      ),
    [pendingInvites]
  );

  const filteredUsers = useMemo(() => {
    const term = normalize(search);
    if (!term) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.businessName, user.phone, user.userType, user.defaultRole]
        .filter(Boolean)
        .some((value) => normalize(String(value)).includes(term))
    );
  }, [search, users]);

  const resetDraft = () => {
    setDraft({
      authMode: "with_invite",
      email: "",
      fullName: "",
      businessName: "",
      phone: "",
      userType: "business",
      defaultRole: "buyer",
    });
    setInvitePlatform("mobile");
    setInviteResult(null);
  };

  const openInviteForUser = (user: DesktopUserRecord) => {
    setInviteTarget(user);
    setInviteOpen(true);
    setInvitePlatform("mobile");
    setInviteResult(null);
    setDraft({
      authMode: "with_invite",
      email: "",
      fullName: user.name,
      businessName: user.businessName ?? "",
      phone: user.phone ?? "",
      userType: user.userType,
      defaultRole: user.defaultRole,
    });
  };

  const handleCreate = async () => {
    if (draft.fullName.trim().length < 2) {
      onMessage({ tone: "error", text: "Full name must be at least 2 characters." });
      return;
    }

    if (draft.phone.trim().length < 10) {
      onMessage({ tone: "error", text: "Phone number must be at least 10 digits." });
      return;
    }

    if (draft.authMode === "with_invite" && !draft.email?.trim()) {
      onMessage({ tone: "error", text: "Email is required to create an invite." });
      return;
    }

    setSaving(true);
    try {
      if (draft.authMode === "with_invite") {
        const invite = await window.managerDesktopApi.users.createInvite({
          email: draft.email?.trim() || "",
          fullName: draft.fullName.trim(),
          businessName: draft.businessName?.trim() || null,
          existingUserId: inviteTarget?.id ?? null,
          phone: draft.phone.trim() || null,
          userType: draft.userType,
          defaultRole: draft.defaultRole,
          requestedPlatform: invitePlatform,
        });
        setInviteResult(invite);
        await loadUsers();

        try {
          await navigator.clipboard.writeText(invite.signupUrl);
          onMessage({
            tone: "success",
            text: inviteTarget ? "Invite created, bound to the selected user, and copied." : "Invite created and copied to clipboard.",
          });
        } catch {
          onMessage({
            tone: "success",
            text: inviteTarget ? "Invite created and bound to the selected user." : "Invite created successfully.",
          });
        }
      } else {
        const created = await window.managerDesktopApi.users.create(draft);
        setUsers((current) => [created, ...current]);
        setCreateOpen(false);
        resetDraft();
        await onDataChanged();
        onMessage({ tone: "success", text: "User created successfully." });
      }
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not create user.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoading label="Loading users..." />;
  }

  return (
    <>
      <div className="content-card">
        <div className="page-header">
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-subtitle">Customers, suppliers, and app accounts from the local read model.</p>
          </div>
          <div className="header-actions">
            <div className="admin-search">
              <Search size={16} />
              <input
                className="text-input compact"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users..."
                value={search}
              />
            </div>
            <button className="primary-button" onClick={() => setCreateOpen(true)} type="button">
              <UserPlus size={16} />
              Create User
            </button>
          </div>
        </div>

        <div className="ledger-table-wrap" style={{ marginTop: 18 }}>
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Business</th>
                <th>Phone</th>
                <th className="align-center">Type</th>
                <th className="align-center">Role</th>
                <th className="align-center">Access</th>
                <th className="align-center">Invite</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="cell-strong">{user.name}</td>
                    <td>{user.businessName || "—"}</td>
                    <td>{user.phone || "—"}</td>
                    <td className="align-center">{user.userType}</td>
                    <td className="align-center">{user.defaultRole}</td>
                    <td className="align-center">
                      <StatusChip
                        label={
                          user.authUserId
                            ? "Linked"
                            : pendingInviteIds.has(user.id)
                              ? "Invite pending"
                              : "Unlinked"
                        }
                        tone={user.authUserId ? "success" : pendingInviteIds.has(user.id) ? "warning" : "muted"}
                      />
                    </td>
                    <td className="align-center">
                      {!user.authUserId && !pendingInviteIds.has(user.id) ? (
                        <button className="secondary-button" onClick={() => openInviteForUser(user)} type="button">
                          Invite
                        </button>
                      ) : (
                        <span className="muted-cell">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="ledger-empty-row" colSpan={7}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {createOpen ? (
        <DesktopModal
          onClose={() => {
            setCreateOpen(false);
            resetDraft();
          }}
          title="Create User"
        >
          <div className="field-grid">
            <div className="field-block">
              <label className="field-label">Account Access</label>
              <select
                className="text-input compact"
                onChange={(event) => {
                  setDraft((current) => ({ ...current, authMode: event.target.value as DesktopUserCreateInput["authMode"] }));
                  setInviteResult(null);
                }}
                value={draft.authMode}
              >
                <option value="with_invite">With invite</option>
                <option value="without_auth">Without login</option>
              </select>
            </div>
            <div className="field-block">
              <label className="field-label">User Type</label>
              <select
                className="text-input compact"
                onChange={(event) => setDraft((current) => ({ ...current, userType: event.target.value as DesktopUserCreateInput["userType"] }))}
                value={draft.userType}
              >
                <option value="business">Business</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>
            <div className="field-block">
              <label className="field-label">Default Role</label>
              <select
                className="text-input compact"
                onChange={(event) => setDraft((current) => ({ ...current, defaultRole: event.target.value as DesktopUserCreateInput["defaultRole"] }))}
                value={draft.defaultRole}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>
            {draft.authMode === "with_invite" ? (
              <>
                <div className="field-block">
                  <label className="field-label">Email</label>
                  <input
                    className="text-input compact"
                    onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                    type="email"
                    value={draft.email ?? ""}
                  />
                </div>
                <div className="field-block">
                  <label className="field-label">Invite opens on</label>
                  <select
                    className="text-input compact"
                    onChange={(event) => setInvitePlatform(event.target.value as "web" | "desktop" | "mobile")}
                    value={invitePlatform}
                  >
                    <option value="mobile">Mobile</option>
                    <option value="desktop">Desktop</option>
                    <option value="web">Web</option>
                  </select>
                </div>
              </>
            ) : null}
            <div className="field-block">
              <label className="field-label">Full Name</label>
              <input
                className="text-input compact"
                onChange={(event) => setDraft((current) => ({ ...current, fullName: event.target.value }))}
                value={draft.fullName}
              />
            </div>
            <div className="field-block">
              <label className="field-label">Business Name</label>
              <input
                className="text-input compact"
                onChange={(event) => setDraft((current) => ({ ...current, businessName: event.target.value }))}
                value={draft.businessName ?? ""}
              />
            </div>
            <div className="field-block">
              <label className="field-label">Phone</label>
              <input
                className="text-input compact"
                onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
                value={draft.phone}
              />
            </div>
            {inviteResult ? (
              <div className="field-block" style={{ gridColumn: "1 / -1" }}>
                <label className="field-label">Invite link</label>
                <div className="content-card" style={{ padding: 14 }}>
                  <div className="page-subtitle" style={{ marginBottom: 10 }}>
                    Share this hosted auth link with the user.
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 12, overflowWrap: "anywhere" }}>
                    {inviteResult.signupUrl}
                  </div>
                  <button
                    className="secondary-button"
                    onClick={() => void navigator.clipboard.writeText(inviteResult.signupUrl)}
                    type="button"
                  >
                    <Copy size={16} />
                    Copy invite
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="dialog-actions">
            <button className="secondary-button" onClick={() => setCreateOpen(false)} type="button">
              Cancel
            </button>
            <button className="primary-button" disabled={saving} onClick={() => void handleCreate()} type="button">
              {saving ? "Saving..." : draft.authMode === "with_invite" ? "Create Invite" : "Create User"}
            </button>
          </div>
        </DesktopModal>
      ) : null}

      {inviteTarget && inviteOpen ? (
        <DesktopModal
          description={`Bind this invite to ${inviteTarget.businessName ? `${inviteTarget.businessName} (${inviteTarget.name})` : inviteTarget.name}.`}
          onClose={() => {
            setInviteOpen(false);
            setInviteTarget(null);
            resetDraft();
          }}
          title="Invite Existing User"
        >
          <div className="field-grid">
            <div className="field-block" style={{ gridColumn: "1 / -1" }}>
              <label className="field-label">Selected row</label>
              <div className="content-card" style={{ padding: 12 }}>
                <div className="cell-strong">
                  {inviteTarget.businessName ? `${inviteTarget.businessName} (${inviteTarget.name})` : inviteTarget.name}
                </div>
                <div className="muted-cell">{inviteTarget.phone || "No phone"}</div>
              </div>
            </div>
            <div className="field-block">
              <label className="field-label">Email</label>
              <input
                className="text-input compact"
                onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                type="email"
                value={draft.email ?? ""}
              />
            </div>
            <div className="field-block">
              <label className="field-label">Invite opens on</label>
              <select
                className="text-input compact"
                onChange={(event) => setInvitePlatform(event.target.value as "web" | "desktop" | "mobile")}
                value={invitePlatform}
              >
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
                <option value="web">Web</option>
              </select>
            </div>
            <div className="field-block">
              <label className="field-label">Full Name</label>
              <input
                className="text-input compact"
                onChange={(event) => setDraft((current) => ({ ...current, fullName: event.target.value }))}
                value={draft.fullName}
              />
            </div>
            <div className="field-block">
              <label className="field-label">Business Name</label>
              <input
                className="text-input compact"
                onChange={(event) => setDraft((current) => ({ ...current, businessName: event.target.value }))}
                value={draft.businessName ?? ""}
              />
            </div>
            <div className="field-block">
              <label className="field-label">Phone</label>
              <input
                className="text-input compact"
                onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
                value={draft.phone}
              />
            </div>
            <div className="field-block">
              <label className="field-label">User Type</label>
              <select className="text-input compact" disabled value={inviteTarget.userType}>
                <option value="business">Business</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>
            <div className="field-block">
              <label className="field-label">Default Role</label>
              <select className="text-input compact" disabled value={inviteTarget.defaultRole}>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>
            {inviteResult ? (
              <div className="field-block" style={{ gridColumn: "1 / -1" }}>
                <label className="field-label">Invite link</label>
                <div className="content-card" style={{ padding: 14 }}>
                  <div className="page-subtitle" style={{ marginBottom: 10 }}>
                    Share this hosted auth link with the user.
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 12, overflowWrap: "anywhere" }}>
                    {inviteResult.signupUrl}
                  </div>
                  <button
                    className="secondary-button"
                    onClick={() => void navigator.clipboard.writeText(inviteResult.signupUrl)}
                    type="button"
                  >
                    <Copy size={16} />
                    Copy invite
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="dialog-actions">
            <button
              className="secondary-button"
              onClick={() => {
                setInviteOpen(false);
                setInviteTarget(null);
                resetDraft();
              }}
              type="button"
            >
              Cancel
            </button>
            <button className="primary-button" disabled={saving} onClick={() => void handleCreate()} type="button">
              {saving ? "Saving..." : "Create Invite"}
            </button>
          </div>
        </DesktopModal>
      ) : null}
    </>
  );
}

export function DesktopProductsPage({
  onDataChanged,
  onMessage,
}: {
  onDataChanged: () => Promise<void>;
  onMessage: MessageHandler;
}): ReactElement {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<DesktopProductRecord[]>([]);
  const [drafts, setDrafts] = useState<ProductDraft[]>([createProductDraft()]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      setProducts(await window.managerDesktopApi.products.list());
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not load products.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = normalize(search);
    if (!term) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.description].filter(Boolean).some((value) => normalize(String(value)).includes(term))
    );
  }, [products, search]);

  const handleCreate = async () => {
    const payload = drafts.filter((draft) => draft.name.trim());
    if (!payload.length) {
      onMessage({ tone: "error", text: "Add at least one product name." });
      return;
    }

    setSaving(true);
    try {
      const created = await window.managerDesktopApi.products.create(payload);
      setProducts((current) => [...created, ...current]);
      setCreateOpen(false);
      setDrafts([createProductDraft()]);
      await onDataChanged();
      onMessage({
        tone: "success",
        text: `${created.length} product${created.length === 1 ? "" : "s"} created successfully.`,
      });
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not create products.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoading label="Loading products..." />;
  }

  return (
    <>
      <div className="content-card">
        <div className="page-header">
          <div>
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">Catalog items available for quotes, sales, and stock batches.</p>
          </div>
          <div className="header-actions">
            <div className="admin-search">
              <Search size={16} />
              <input
                className="text-input compact"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                value={search}
              />
            </div>
            <button className="primary-button" onClick={() => setCreateOpen(true)} type="button">
              <Plus size={16} />
              New Product
            </button>
          </div>
        </div>

        <div className="ledger-table-wrap" style={{ marginTop: 18 }}>
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th className="align-center">Stock Tracked</th>
                <th className="align-right">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="cell-strong">{product.name}</td>
                    <td>{product.description || "—"}</td>
                    <td className="align-center">
                      <StatusChip
                        label={product.isStockTracked ? "Yes" : "No"}
                        tone={product.isStockTracked ? "success" : "muted"}
                      />
                    </td>
                    <td className="align-right">{formatDate(product.updatedAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="ledger-empty-row" colSpan={4}>
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {createOpen ? (
        <DesktopModal
          description="Add one or more products to the catalog."
          onClose={() => {
            setCreateOpen(false);
            setDrafts([createProductDraft()]);
          }}
          title="Create Products"
          width={760}
        >
          <div className="admin-line-stack">
            {drafts.map((draft, index) => (
              <div className="admin-line-card" key={draft.id}>
                <div className="admin-line-head">
                  <span className="line-badge">#{index + 1}</span>
                  {drafts.length > 1 ? (
                    <button
                      className="ghost-button icon-button"
                      onClick={() => setDrafts((current) => current.filter((entry) => entry.id !== draft.id))}
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
                <div className="field-grid">
                  <div className="field-block">
                    <label className="field-label">Product Name</label>
                    <input
                      className="text-input compact"
                      onChange={(event) =>
                        setDrafts((current) =>
                          current.map((entry) =>
                            entry.id === draft.id ? { ...entry, name: event.target.value } : entry
                          )
                        )
                      }
                      value={draft.name}
                    />
                  </div>
                  <div className="field-block">
                    <label className="field-label">Description</label>
                    <input
                      className="text-input compact"
                      onChange={(event) =>
                        setDrafts((current) =>
                          current.map((entry) =>
                            entry.id === draft.id ? { ...entry, description: event.target.value } : entry
                          )
                        )
                      }
                      value={draft.description ?? ""}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="dialog-segment-row">
            <button
              className="secondary-button"
              onClick={() => setDrafts((current) => [...current, createProductDraft()])}
              type="button"
            >
              <Plus size={16} />
              Add Row
            </button>
          </div>
          <div className="dialog-actions">
            <button className="secondary-button" onClick={() => setCreateOpen(false)} type="button">
              Cancel
            </button>
            <button className="primary-button" disabled={saving} onClick={() => void handleCreate()} type="button">
              {saving ? "Saving..." : "Save Products"}
            </button>
          </div>
        </DesktopModal>
      ) : null}
    </>
  );
}

export function DesktopStockPage({
  onDataChanged,
  onMessage,
}: {
  onDataChanged: () => Promise<void>;
  onMessage: MessageHandler;
}): ReactElement {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [overview, setOverview] = useState<DesktopStockOverview | null>(null);
  const [drafts, setDrafts] = useState<StockDraft[]>([createStockDraft()]);
  const [productDraft, setProductDraft] = useState<ManagerInlineProductDraft>({ name: "", description: "" });
  const [productCreateOpen, setProductCreateOpen] = useState(false);
  const [activeStockDraftId, setActiveStockDraftId] = useState<string | null>(null);

  const loadOverview = async () => {
    setLoading(true);
    try {
      setOverview(await window.managerDesktopApi.stock.getOverview());
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not load stock batches.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const productOptions = useMemo<SelectionOption[]>(
    () =>
      (overview?.products ?? []).map((product) => ({
        value: product.id,
        label: product.name,
        description: product.description,
      })),
    [overview?.products]
  );
  const sellerOptions = overview?.sellers ?? [];
  const supplierOptions = useMemo(
    () => (overview?.suppliers ?? []).map(toUserOption),
    [overview?.suppliers]
  );

  const filteredBatches = useMemo(() => {
    const term = normalize(search);
    if (!term) {
      return overview?.batches ?? [];
    }

    return (overview?.batches ?? []).filter((batch) =>
      [batch.batchCode, batch.productName, batch.mfcSellerName, batch.supplierName]
        .filter(Boolean)
        .some((value) => normalize(String(value)).includes(term))
    );
  }, [overview?.batches, search]);

  const handleCreateProduct = async () => {
    if (productDraft.name.trim().length < 2) {
      onMessage({ tone: "error", text: "Product name must be at least 2 characters." });
      return;
    }

    setSaving(true);
    try {
      const [created] = await window.managerDesktopApi.products.create([
        {
          name: productDraft.name,
          description: productDraft.description,
          isStockTracked: true,
        },
      ]);

      if (!created) {
        throw new Error("No product was created.");
      }

      setOverview((current) =>
        current
          ? {
              ...current,
              products: [created, ...current.products],
            }
          : current
      );
      if (activeStockDraftId) {
        setDrafts((current) =>
          current.map((draft) =>
            draft.id === activeStockDraftId
              ? { ...draft, productId: created.id, productName: created.name }
              : draft
          )
        );
      }
      setProductCreateOpen(false);
      setActiveStockDraftId(null);
      await onDataChanged();
      onMessage({ tone: "success", text: "Product created successfully." });
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not create product.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    const payload = drafts.filter(
      (draft) => (draft.productId || draft.productName?.trim()) && draft.mfcSellerId && Number(draft.initialWeightKg) > 0
    );

    if (!payload.length) {
      onMessage({
        tone: "error",
        text: "Add at least one batch with product, assigned seller, and weight.",
      });
      return;
    }

    setSaving(true);
    try {
      const result = await window.managerDesktopApi.stock.create(payload);
      setCreateOpen(false);
      setDrafts([createStockDraft()]);
      await Promise.all([loadOverview(), onDataChanged()]);
      onMessage({
        tone: "success",
        text: `${result.count} stock batch${result.count === 1 ? "" : "es"} created successfully.`,
      });
    } catch (error) {
      onMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Could not create stock batches.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !overview) {
    return <PageLoading label="Loading stock batches..." />;
  }

  return (
    <>
      <div className="content-card">
        <div className="page-header">
          <div>
            <h1 className="page-title">Stock</h1>
            <p className="page-subtitle">Batch inventory assigned to MFC sellers and suppliers.</p>
          </div>
          <div className="header-actions">
            <div className="admin-search">
              <Search size={16} />
              <input
                className="text-input compact"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search stock..."
                value={search}
              />
            </div>
            <button className="primary-button" onClick={() => setCreateOpen(true)} type="button">
              <PackagePlus size={16} />
              New Batch
            </button>
          </div>
        </div>

        <div className="ledger-table-wrap" style={{ marginTop: 18 }}>
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Product</th>
                <th>Assigned To</th>
                <th>Supplier</th>
                <th className="align-right">Initial</th>
                <th className="align-right">Current</th>
                <th className="align-right">Cost/kg</th>
                <th className="align-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.length ? (
                filteredBatches.map((batch) => {
                  const ratio = batch.initialWeightKg > 0 ? batch.currentWeightKg / batch.initialWeightKg : 0;
                  const status =
                    batch.currentWeightKg === 0 ? "empty" : ratio < 0.2 ? "low" : "available";

                  return (
                    <tr key={batch.id}>
                      <td className="cell-strong">{batch.batchCode || "—"}</td>
                      <td>{batch.productName || "Unknown"}</td>
                      <td>{batch.mfcSellerName || "—"}</td>
                      <td>{batch.supplierName || "—"}</td>
                      <td className="align-right">{batch.initialWeightKg.toFixed(2)} kg</td>
                      <td className="align-right">{batch.currentWeightKg.toFixed(2)} kg</td>
                      <td className="align-right">
                        {batch.costPerKg !== null ? formatCurrency(batch.costPerKg) : "—"}
                      </td>
                      <td className="align-center">
                        <StatusChip label={status} tone={getStatusTone(status)} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="ledger-empty-row" colSpan={8}>
                    No stock batches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {createOpen ? (
        <DesktopModal
          description="Create one or more stock batches and assign them to an MFC seller."
          onClose={() => {
            setCreateOpen(false);
            setDrafts([createStockDraft()]);
          }}
          title="Create Stock Batches"
          width={980}
        >
          <div className="admin-line-stack">
            {drafts.map((draft, index) => (
              <div className="admin-line-card" key={draft.id}>
                <div className="admin-line-head">
                  <span className="line-badge">#{index + 1}</span>
                  {drafts.length > 1 ? (
                    <button
                      className="ghost-button icon-button"
                      onClick={() => setDrafts((current) => current.filter((entry) => entry.id !== draft.id))}
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
                <div className="field-grid">
                  <AutocompleteField
                    createAction={
                      <button
                        className="secondary-button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          setProductDraft({ name: draft.productName?.trim() || "", description: "" });
                          setActiveStockDraftId(draft.id);
                          setProductCreateOpen(true);
                        }}
                        type="button"
                      >
                        Create product
                      </button>
                    }
                    emptyLabel="No matching product"
                    label="Product"
                    onChange={(nextValue) =>
                      setDrafts((current) =>
                        current.map((entry) =>
                          entry.id === draft.id ? { ...entry, productId: null, productName: nextValue } : entry
                        )
                      )
                    }
                    onSelect={(option) =>
                      setDrafts((current) =>
                        current.map((entry) =>
                          entry.id === draft.id ? { ...entry, productId: option.value, productName: option.label } : entry
                        )
                      )
                    }
                    options={productOptions}
                    placeholder="Search or create product..."
                    value={draft.productName ?? ""}
                  />
                  <div className="field-block">
                    <label className="field-label">Assign to Staff</label>
                    <select
                      className="text-input compact"
                      onChange={(event) =>
                        setDrafts((current) =>
                          current.map((entry) =>
                            entry.id === draft.id ? { ...entry, mfcSellerId: event.target.value } : entry
                          )
                        )
                      }
                      value={draft.mfcSellerId}
                    >
                      <option value="">Select seller</option>
                      {sellerOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-block">
                    <label className="field-label">Supplier</label>
                    <select
                      className="text-input compact"
                      onChange={(event) =>
                        setDrafts((current) =>
                          current.map((entry) =>
                            entry.id === draft.id
                              ? { ...entry, supplierId: event.target.value || null }
                              : entry
                          )
                        )
                      }
                      value={draft.supplierId ?? ""}
                    >
                      <option value="">Select supplier</option>
                      {supplierOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-block">
                    <label className="field-label">Initial Weight (kg)</label>
                    <input
                      className="text-input compact"
                      inputMode="decimal"
                      onChange={(event) =>
                        setDrafts((current) =>
                          current.map((entry) =>
                            entry.id === draft.id
                              ? { ...entry, initialWeightKg: Number(event.target.value || 0) }
                              : entry
                          )
                        )
                      }
                      type="number"
                      value={draft.initialWeightKg || ""}
                    />
                  </div>
                  <div className="field-block">
                    <label className="field-label">Cost/kg</label>
                    <input
                      className="text-input compact"
                      inputMode="decimal"
                      onChange={(event) =>
                        setDrafts((current) =>
                          current.map((entry) =>
                            entry.id === draft.id
                              ? { ...entry, costPerKg: event.target.value ? Number(event.target.value) : null }
                              : entry
                          )
                        )
                      }
                      type="number"
                      value={draft.costPerKg ?? ""}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {productCreateOpen ? (
            <div className="inline-create-card">
              <div className="section-heading">
                <div>
                  <h3>Create Product</h3>
                  <p>Add the missing product without leaving stock creation.</p>
                </div>
                <button className="ghost-button" onClick={() => setProductCreateOpen(false)} type="button">
                  Close
                </button>
              </div>
              <div className="field-grid">
                <div className="field-block">
                  <label className="field-label">Product Name</label>
                  <input
                    className="text-input compact"
                    onChange={(event) =>
                      setProductDraft((current) => ({ ...current, name: event.target.value }))
                    }
                    value={productDraft.name}
                  />
                </div>
                <div className="field-block">
                  <label className="field-label">Description</label>
                  <input
                    className="text-input compact"
                    onChange={(event) =>
                      setProductDraft((current) => ({ ...current, description: event.target.value }))
                    }
                    value={productDraft.description}
                  />
                </div>
              </div>
              <div className="dialog-actions">
                <button className="primary-button" disabled={saving} onClick={() => void handleCreateProduct()} type="button">
                  {saving ? "Creating..." : "Create Product"}
                </button>
              </div>
            </div>
          ) : null}

          <div className="dialog-segment-row">
            <button
              className="secondary-button"
              onClick={() => setDrafts((current) => [...current, createStockDraft()])}
              type="button"
            >
              <Plus size={16} />
              Add Batch Row
            </button>
          </div>

          <div className="dialog-actions">
            <button className="secondary-button" onClick={() => setCreateOpen(false)} type="button">
              Cancel
            </button>
            <button className="primary-button" disabled={saving} onClick={() => void handleCreate()} type="button">
              {saving ? "Saving..." : "Save Batches"}
            </button>
          </div>
        </DesktopModal>
      ) : null}
    </>
  );
}

export function DesktopSettingsPage({
  onLock,
  onLogout,
  onRefresh,
  onSecurityChanged,
  profile,
  securitySnapshot,
  syncStatus,
}: {
  onLock: () => void;
  onLogout: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onSecurityChanged: (snapshot: DesktopLocalSecuritySnapshot) => void;
  profile: StaffProfile;
  securitySnapshot: DesktopLocalSecuritySnapshot;
  syncStatus: SyncStatus | null;
}): ReactElement {
  const [landing, setLanding] = useState(getDesktopLandingPreference());

  useEffect(() => {
    setLanding(getDesktopLandingPreference());
  }, []);

  return (
    <div className="content-grid">
      <div className="content-card">
        <div className="page-header">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Desktop preferences and sync behavior.</p>
          </div>
        </div>

        <div className="admin-settings-stack">
          <section className="admin-settings-card">
            <div className="section-heading">
              <div>
                <h3>Preferences</h3>
                <p>Choose where the desktop manager should open after login.</p>
              </div>
            </div>
            <div className="field-block" style={{ maxWidth: 360 }}>
              <label className="field-label">Default landing page</label>
              <select
                className="text-input compact"
                onChange={(event) => {
                  setDesktopLandingPreference(event.target.value);
                  setLanding(event.target.value);
                }}
                value={landing}
              >
                {DESKTOP_LANDING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="field-helper">Default is Customer Ledger Day.</div>
            </div>
          </section>

          <section className="admin-settings-card">
            <div className="section-heading">
              <div>
                <h3>Sync Status</h3>
                <p>Check the current desktop PowerSync state.</p>
              </div>
              <button className="secondary-button" onClick={() => void onRefresh()} type="button">
                Refresh
              </button>
            </div>
            <div className="admin-settings-grid">
              <div className="admin-settings-metric">
                <span>Status</span>
                <strong>{syncStatus?.connected ? "Connected" : syncStatus?.connecting ? "Connecting" : "Waiting"}</strong>
              </div>
              <div className="admin-settings-metric">
                <span>Last sync</span>
                <strong>
                  {syncStatus?.lastSyncedAt ? new Date(syncStatus.lastSyncedAt).toLocaleString("en-IN") : "Not yet"}
                </strong>
              </div>
              <div className="admin-settings-metric">
                <span>Last error</span>
                <strong>{syncStatus?.lastError || "None"}</strong>
              </div>
            </div>
          </section>

          <DesktopLocalSecuritySettings
            onLock={onLock}
            onLogout={onLogout}
            onSnapshotChange={onSecurityChanged}
            profile={profile}
            snapshot={securitySnapshot}
          />
        </div>
      </div>

      <div className="status-card">
        <div className="tile-icon">
          <Settings2 size={20} />
        </div>
        <div className="tile-title">Desktop manager preferences</div>
        <div className="tile-copy">
          Landing, sync, and device-local unlock now live together in the desktop settings shell.
        </div>
      </div>
    </div>
  );
}
