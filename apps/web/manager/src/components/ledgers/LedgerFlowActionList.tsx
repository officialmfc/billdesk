"use client";

import { BookCopy, Clock3, FileSearch, ReceiptText, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type Props = {
  onSelectFlow: (href: string) => void;
};

const sections = [
  {
    items: [
      {
        description: "Purchased today plus carry-forward due, ready for fast collection work.",
        href: "/ledgers/customers/day",
        icon: ReceiptText,
        key: "customers-day",
        meta: "Day sheet",
        title: "Customer Day",
      },
      {
        description: "Date-wise customer bill detail with print-ready customer ledger output.",
        href: "/ledgers/customers/detail",
        icon: FileSearch,
        key: "customers-detail",
        meta: "Detail",
        title: "Customer Detail",
      },
      {
        description: "Compact bill and payment history for a selected customer.",
        href: "/ledgers/customers/history",
        icon: Clock3,
        key: "customers-history",
        meta: "History",
        title: "Customer History",
      },
    ],
    title: "Customers",
  },
  {
    items: [
      {
        description: "Selected-date seller chalan sheet with payable totals.",
        href: "/ledgers/sellers/day",
        icon: Wallet,
        key: "sellers-day",
        meta: "Day sheet",
        title: "Seller Day",
      },
      {
        description: "Date-wise seller payout history and net payable trail.",
        href: "/ledgers/sellers/history",
        icon: BookCopy,
        key: "sellers-history",
        meta: "History",
        title: "Seller History",
      },
    ],
    title: "Sellers",
  },
] as const;

const colorByKey = {
  "customers-day": "text-blue-600",
  "customers-detail": "text-sky-600",
  "customers-history": "text-violet-600",
  "sellers-day": "text-emerald-600",
  "sellers-history": "text-amber-600",
} as const;

export function LedgerFlowActionList({ onSelectFlow }: Props): React.JSX.Element {
  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <Card key={section.title} className="rounded-[24px] border-border/90 shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="text-base font-semibold text-foreground">{section.title}</div>
            <div className="space-y-3">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelectFlow(item.href)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-3 rounded-[20px] border border-border/90 px-4 py-3 transition-colors hover:bg-muted/30">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/8">
                        <Icon className={`h-5 w-5 ${colorByKey[item.key]}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-foreground">{item.title}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                        <div className="mt-2 text-[11px] font-medium text-primary">{item.meta}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
