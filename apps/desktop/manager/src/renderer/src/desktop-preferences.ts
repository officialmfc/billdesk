const LANDING_PREFERENCE_KEY = "mfc_desktop_default_landing";

export const DEFAULT_DESKTOP_LANDING = "/ledgers/customers/day";

export const DESKTOP_LANDING_OPTIONS = [
  { value: DEFAULT_DESKTOP_LANDING, label: "Customer Ledger Day" },
  { value: "/ledgers/sellers/day", label: "Seller Ledger Day" },
  { value: "/sales", label: "Sales Hub" },
  { value: "/sales/auction/new", label: "Auction Sale" },
  { value: "/sales/mfc/batch/new", label: "Batch Sale" },
  { value: "/payments", label: "Payments" },
  { value: "/quotes", label: "Quotes" },
  { value: "/users", label: "Users" },
  { value: "/products", label: "Products" },
  { value: "/stock", label: "Stock" },
  { value: "/settings", label: "Settings" },
] as const;

export function getDesktopLandingPreference(): string {
  if (typeof window === "undefined") {
    return DEFAULT_DESKTOP_LANDING;
  }

  return window.localStorage.getItem(LANDING_PREFERENCE_KEY) || DEFAULT_DESKTOP_LANDING;
}

export function setDesktopLandingPreference(href: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LANDING_PREFERENCE_KEY, href);
}
