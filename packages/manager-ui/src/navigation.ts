export type ManagerNavigationSection =
  | "Operations"
  | "Accounts"
  | "People"
  | "Catalog"
  | "System";

export type ManagerNavigationKey =
  | "home"
  | "sales"
  | "operations"
  | "payments"
  | "spendings"
  | "ledgers"
  | "quotes"
  | "approvals"
  | "users"
  | "products"
  | "stock"
  | "settings";

export interface ManagerNavigationDefinition {
  key: ManagerNavigationKey;
  label: string;
  href: string;
  section: ManagerNavigationSection;
  description?: string;
  quickAdd?: string;
  showInMobileTabs?: boolean;
  mobileRoute?: string;
}

export const managerNavigationDefinitions: readonly ManagerNavigationDefinition[] = [
  {
    key: "home",
    label: "Dashboard",
    href: "/dashboard",
    section: "System",
    description: "Fallback hub with every manager section and shortcut",
    mobileRoute: "index",
  },
  {
    key: "sales",
    label: "Sales",
    href: "/sales",
    section: "Operations",
    description: "Create and manage sales",
    showInMobileTabs: true,
    mobileRoute: "sales",
  },
  {
    key: "operations",
    label: "Bill & Chalan",
    href: "/operations",
    section: "Operations",
    description: "Due register, chalans, buyer sheets, and verification",
    showInMobileTabs: true,
    mobileRoute: "operations",
  },
  {
    key: "ledgers",
    label: "Ledgers",
    href: "/ledgers",
    section: "Accounts",
    description: "Due and payment history",
    showInMobileTabs: true,
    mobileRoute: "ledgers",
  },
  {
    key: "payments",
    label: "Payments",
    href: "/payments",
    section: "Accounts",
    description: "Collections and payouts",
    showInMobileTabs: true,
    mobileRoute: "payments",
  },
  {
    key: "spendings",
    label: "Spendings",
    href: "/payments/spendings",
    section: "Accounts",
    description: "Manager expense register",
  },
  {
    key: "quotes",
    label: "Quotes",
    href: "/quotes",
    section: "Accounts",
    description: "Pending and confirmed quotes",
  },
  {
    key: "approvals",
    label: "Approvals",
    href: "/approvals",
    section: "People",
    description: "Registrations and pending actions",
  },
  {
    key: "users",
    label: "Users",
    href: "/users",
    section: "People",
    description: "Customers, sellers, staff",
  },
  {
    key: "products",
    label: "Products",
    href: "/products",
    section: "Catalog",
    description: "Sale items and rates",
    quickAdd: "/products/new",
  },
  {
    key: "stock",
    label: "Stock",
    href: "/stock",
    section: "Catalog",
    description: "Batch stock and supply",
    quickAdd: "/stock/new",
  },
  {
    key: "settings",
    label: "Settings",
    href: "/settings",
    section: "System",
    description: "Manager preferences and setup",
  },
] as const;

export const managerMobileTabs = managerNavigationDefinitions.filter(
  (item) => item.showInMobileTabs
);

export const managerSettingsDefinition = managerNavigationDefinitions.find(
  (item) => item.key === "settings"
) as ManagerNavigationDefinition;

export const managerMobileMoreDefinitions = managerNavigationDefinitions.filter(
  (item) => !item.showInMobileTabs
);

export const managerNavigationSections = [
  "Operations",
  "Accounts",
  "People",
  "Catalog",
] as const;

export interface ManagerDesktopNavigationItemDefinition {
  key: string;
  label: string;
  href: string;
  matchPrefixes?: string[];
}

export interface ManagerDesktopNavigationGroupDefinition {
  title: string;
  items: readonly ManagerDesktopNavigationItemDefinition[];
}

export const managerDesktopNavigationGroups: readonly ManagerDesktopNavigationGroupDefinition[] = [
  {
    title: "Sales",
    items: [
      {
        key: "sales-hub",
        label: "Sales Hub",
        href: "/sales",
        matchPrefixes: ["/sales"],
      },
      {
        key: "sale-auction",
        label: "Auction Sale",
        href: "/sales/auction/new",
        matchPrefixes: ["/sales/auction"],
      },
      {
        key: "sale-pos",
        label: "POS Sale",
        href: "/sales/mfc/pos/new",
        matchPrefixes: ["/sales/mfc/pos"],
      },
      {
        key: "sale-batch",
        label: "Batch Sale",
        href: "/sales/mfc/batch/new",
        matchPrefixes: ["/sales/mfc/batch"],
      },
      {
        key: "sale-floor",
        label: "Floor Sale",
        href: "/sales/mfc/floor/new",
        matchPrefixes: ["/sales/mfc/floor"],
      },
    ],
  },
  {
    title: "Bill & Chalan",
    items: [
      {
        key: "operations-overview",
        label: "Desk",
        href: "/operations",
        matchPrefixes: ["/operations"],
      },
      {
        key: "operations-due",
        label: "Due & Collection",
        href: "/operations/due-collection",
        matchPrefixes: ["/operations/due-collection"],
      },
      {
        key: "operations-chalans",
        label: "Daily Chalans",
        href: "/operations/chalans",
        matchPrefixes: ["/operations/chalans"],
      },
      {
        key: "operations-buyers",
        label: "Buyer Purchases",
        href: "/operations/buyer-purchases",
        matchPrefixes: ["/operations/buyer-purchases"],
      },
      {
        key: "operations-verification",
        label: "Chalan Verification",
        href: "/operations/chalan-verification",
        matchPrefixes: ["/operations/chalan-verification"],
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        key: "payments-main",
        label: "Payments",
        href: "/payments",
      },
      {
        key: "payments-spendings",
        label: "Spendings",
        href: "/payments/spendings",
        matchPrefixes: ["/payments/spendings"],
      },
    ],
  },
  {
    title: "Ledgers",
    items: [
      {
        key: "ledgers-overview",
        label: "Ledger Desk",
        href: "/ledgers",
      },
      {
        key: "ledgers-customers-day",
        label: "Customer Day",
        href: "/ledgers/customers/day",
        matchPrefixes: ["/ledgers/customers/day", "/ledgers/day"],
      },
      {
        key: "ledgers-customers-detail",
        label: "Customer Detail",
        href: "/ledgers/customers/detail",
        matchPrefixes: ["/ledgers/customers/detail", "/ledgers/customers/bill"],
      },
      {
        key: "ledgers-customers-history",
        label: "Customer History",
        href: "/ledgers/customers/history",
        matchPrefixes: ["/ledgers/customers/history"],
      },
      {
        key: "ledgers-sellers-day",
        label: "Seller Day",
        href: "/ledgers/sellers/day",
        matchPrefixes: ["/ledgers/sellers/day", "/ledgers/sellers"],
      },
      {
        key: "ledgers-sellers-history",
        label: "Seller History",
        href: "/ledgers/sellers/history",
        matchPrefixes: ["/ledgers/sellers/history"],
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        key: "payments",
        label: "Payments",
        href: "/payments",
        matchPrefixes: ["/payments", "/payment/new"],
      },
      {
        key: "quotes",
        label: "Quotes",
        href: "/quotes",
        matchPrefixes: ["/quotes"],
      },
    ],
  },
  {
    title: "People",
    items: [
      {
        key: "approvals",
        label: "Approvals",
        href: "/approvals",
        matchPrefixes: ["/approvals"],
      },
      {
        key: "users",
        label: "Users",
        href: "/users",
        matchPrefixes: ["/users"],
      },
    ],
  },
  {
    title: "Catalog",
    items: [
      {
        key: "products",
        label: "Products",
        href: "/products",
        matchPrefixes: ["/products"],
      },
      {
        key: "stock",
        label: "Stock",
        href: "/stock",
        matchPrefixes: ["/stock", "/inventory"],
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        key: "settings",
        label: "Settings",
        href: "/settings",
        matchPrefixes: ["/settings"],
      },
      {
        key: "dashboard",
        label: "Dashboard",
        href: "/dashboard",
        matchPrefixes: ["/dashboard", "/"],
      },
    ],
  },
] as const;
