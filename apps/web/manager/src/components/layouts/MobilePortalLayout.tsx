'use client';

/**
 * Mobile Portal Layout
 * Optimized for small screens only
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    BookCopy,
    FileText,
    Menu,
    ReceiptText,
    ShoppingBag,
    WalletCards
} from "lucide-react";
import { managerMobileTabs, type ManagerNavigationKey } from "@mfc/manager-ui";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { navigationItems, settingsItem } from "@/config/navigation";
import { SalesFlowActionList } from "@/components/sales/SalesFlowActionList";
import { LedgerFlowActionList } from "@/components/ledgers/LedgerFlowActionList";

const mobileMoreItems = [
  ...navigationItems.filter(item => !item.showInMobileTabs),
  settingsItem
];
const iconByKey: Record<ManagerNavigationKey, typeof ShoppingBag> = {
  home: FileText,
  sales: ShoppingBag,
  operations: ReceiptText,
  payments: WalletCards,
  spendings: WalletCards,
  ledgers: BookCopy,
  quotes: FileText,
  approvals: FileText,
  users: Menu,
  products: ShoppingBag,
  stock: ShoppingBag,
  settings: Menu,
};

export function MobilePortalLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [salesPickerOpen, setSalesPickerOpen] = useState(false);
  const [ledgerPickerOpen, setLedgerPickerOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return (
        pathname === "/dashboard" ||
        pathname === "/" ||
        pathname.startsWith("/dashboard/")
      );
    }
    return pathname.startsWith(href);
  };

  const isMoreActive =
    pathname === "/more" ||
    pathname.startsWith("/more/") ||
    mobileMoreItems.some((item) => isActive(item.href));

  return (
    <div className="relative flex h-screen bg-background flex-col">
      <div className="absolute right-3 top-3 z-50">
        <ThemeToggle />
      </div>
      {/* Page Content */}
      <main className="flex-1 overflow-y-auto pb-20 px-1 py-4">{children}</main>

      <Sheet open={salesPickerOpen} onOpenChange={setSalesPickerOpen}>
        <SheetContent side="bottom" className="rounded-t-[28px] px-4 pb-6">
          <SheetHeader className="px-0">
            <SheetTitle>New Sale</SheetTitle>
            <SheetDescription>Choose the sales workflow</SheetDescription>
          </SheetHeader>
          <SalesFlowActionList
            onSelectFlow={(href) => {
              setSalesPickerOpen(false);
              router.push(href);
            }}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={ledgerPickerOpen} onOpenChange={setLedgerPickerOpen}>
        <SheetContent side="bottom" className="rounded-t-[28px] px-4 pb-6">
          <SheetHeader className="px-0">
            <SheetTitle>Ledgers</SheetTitle>
            <SheetDescription>Choose the ledger workflow</SheetDescription>
          </SheetHeader>
          <LedgerFlowActionList
            onSelectFlow={(href) => {
              setLedgerPickerOpen(false);
              router.push(href);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-inset-bottom">
        <div className="mx-auto flex h-[76px] max-w-3xl items-center justify-around rounded-t-[28px] border-x border-border bg-card px-2">
          {managerMobileTabs.map((item) => {
            const Icon = iconByKey[item.key];
            const active = isActive(item.href);

            if (item.key === "sales") {
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => setSalesPickerOpen(true)}
                  className={cn(
                    "flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors",
                    active || salesPickerOpen ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className={cn("h-6 w-6", active || salesPickerOpen ? "stroke-[2.2]" : "stroke-[1.9]")} />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              );
            }

            if (item.key === "ledgers") {
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => setLedgerPickerOpen(true)}
                  className={cn(
                    "flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors",
                    active || ledgerPickerOpen ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6",
                      active || ledgerPickerOpen ? "stroke-[2.2]" : "stroke-[1.9]"
                    )}
                  />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-6 w-6", active ? "stroke-[2.2]" : "stroke-[1.9]")} />
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            );
          })}

          <Link
            href="/more"
            className={cn(
              "flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors",
              isMoreActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Menu className={cn("h-6 w-6", isMoreActive ? "stroke-[2.2]" : "stroke-[1.9]")} />
            <span className="text-xs font-semibold">More</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
