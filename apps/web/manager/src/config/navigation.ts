import {
    Banknote,
    BookCopy,
    ClipboardList,
    Gavel,
    LayoutDashboard,
    PackagePlus,
    ReceiptText,
    WalletCards,
    Settings,
    ShoppingBag,
    ShoppingCart,
    ShieldCheck,
    Store,
    UserCheck,
    Users,
    Wallet,
    Zap,
    type LucideIcon,
} from "lucide-react";
import {
  managerDesktopNavigationGroups,
  managerNavigationDefinitions,
  managerSettingsDefinition,
  type ManagerNavigationKey,
} from "@mfc/manager-ui";

export interface NavigationItem {
  icon: LucideIcon;
  name: string;
  href: string;
  section: "Operations" | "Accounts" | "People" | "Catalog" | "System";
  description?: string;
  showInMobileTabs?: boolean;
  quickAdd?: string;
}

const iconByKey: Record<ManagerNavigationKey, LucideIcon> = {
  home: LayoutDashboard,
  sales: ShoppingCart,
  operations: ReceiptText,
  payments: Banknote,
  spendings: WalletCards,
  ledgers: BookCopy,
  quotes: ClipboardList,
  approvals: UserCheck,
  users: Users,
  products: ShoppingBag,
  stock: PackagePlus,
  settings: Settings,
};

function toNavigationItem(item: (typeof managerNavigationDefinitions)[number]): NavigationItem {
  return {
    icon: iconByKey[item.key],
    name: item.label,
    href: item.href,
    section: item.section,
    description: item.description,
    showInMobileTabs: item.showInMobileTabs,
    quickAdd: item.quickAdd,
  };
}

export const navigationItems: NavigationItem[] = managerNavigationDefinitions
  .filter((item) => item.key !== "settings")
  .map(toNavigationItem);

export const settingsItem: NavigationItem = toNavigationItem(managerSettingsDefinition);

export interface DesktopNavigationItem {
  icon: LucideIcon;
  name: string;
  href: string;
  matchPrefixes?: string[];
}

export interface DesktopNavigationGroup {
  title: string;
  items: DesktopNavigationItem[];
}

const desktopIconByHref: Record<string, LucideIcon> = {
  "/sales": ShoppingCart,
  "/sales/auction/new": Gavel,
  "/sales/mfc/pos/new": Store,
  "/sales/mfc/batch/new": Users,
  "/sales/mfc/floor/new": Zap,
  "/operations": ReceiptText,
  "/operations/due-collection": Wallet,
  "/operations/chalans": ReceiptText,
  "/operations/buyer-purchases": Users,
  "/operations/chalan-verification": ShieldCheck,
  "/payments": Banknote,
  "/payments/spendings": WalletCards,
  "/ledgers": BookCopy,
  "/ledgers/customers/day": BookCopy,
  "/ledgers/customers/detail": BookCopy,
  "/ledgers/customers/history": BookCopy,
  "/ledgers/sellers/day": BookCopy,
  "/ledgers/sellers/history": BookCopy,
  "/quotes": ClipboardList,
  "/approvals": UserCheck,
  "/users": Users,
  "/products": ShoppingBag,
  "/stock": PackagePlus,
  "/settings": Settings,
  "/dashboard": LayoutDashboard,
};

export const desktopNavigationGroups: DesktopNavigationGroup[] = managerDesktopNavigationGroups.map((group) => ({
  title: group.title,
  items: group.items.map((item) => ({
    icon: desktopIconByHref[item.href] ?? LayoutDashboard,
    name: item.label,
    href: item.href,
    matchPrefixes: item.matchPrefixes ? [...item.matchPrefixes] : undefined,
  })),
}));
