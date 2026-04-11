"use client";

import { format } from "date-fns";
import { ManagerDateNavigator } from "@mfc/manager-ui";
import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  ReceiptText,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DailyOperationsPageKey =
  | "overview"
  | "due-collection"
  | "chalans"
  | "buyer-purchases"
  | "verification";

export type DailyOperationsNavItem = {
  key: DailyOperationsPageKey;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const dailyOperationsNavItems: DailyOperationsNavItem[] = [
  {
    key: "overview",
    name: "Daily Operations",
    description: "Overview and desk shortcuts",
    href: "/operations",
    icon: LayoutGrid,
  },
  {
    key: "due-collection",
    name: "Customer Due & Collection",
    description: "Compact due register and payment entry",
    href: "/operations/due-collection",
    icon: Wallet,
  },
  {
    key: "chalans",
    name: "Daily Chalans",
    description: "Seller challans without buyer names",
    href: "/operations/chalans",
    icon: ReceiptText,
  },
  {
    key: "buyer-purchases",
    name: "Buyer Purchases",
    description: "Buyer-wise cards and item history",
    href: "/operations/buyer-purchases",
    icon: Users,
  },
  {
    key: "verification",
    name: "Chalan Verification",
    description: "Internal buyer-name check view",
    href: "/operations/chalan-verification",
    icon: ShieldCheck,
  },
];

export function formatOperationsCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

export function OperationsMetricCard({
  label,
  note,
  tone,
  value,
}: {
  label: string;
  note?: string;
  tone?: string;
  value: string;
}) {
  return (
    <Card className="rounded-[24px] border-border/70 bg-card shadow-sm">
      <CardContent className="space-y-1.5 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className={cn("text-xl font-semibold tracking-tight", tone)}>{value}</p>
        {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      </CardContent>
    </Card>
  );
}

export function DailyOperationsLoadingState(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div className="h-32 rounded-[28px] bg-muted animate-pulse" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="h-24 rounded-[24px] bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function DailyOperationsShell({
  actions,
  buildHref,
  children,
  description,
  onNextDay,
  onPreviousDay,
  onSelectedDate,
  onToday,
  selectedDate,
  title,
}: {
  actions?: ReactNode;
  buildHref: (href: string) => string;
  children: ReactNode;
  currentPage: DailyOperationsPageKey;
  description: string;
  onNextDay: () => void;
  onPreviousDay: () => void;
  onSelectedDate?: (nextDate: Date) => void;
  onToday: () => void;
  selectedDate: Date;
  title: string;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {actions ? <div className="flex flex-wrap items-center gap-2 pt-1">{actions}</div> : null}
      </div>

      <ManagerDateNavigator
        dateValue={format(selectedDate, "yyyy-MM-dd")}
        onChange={(nextDate) => {
          onSelectedDate?.(new Date(`${nextDate}T00:00:00`));
        }}
        onNext={onNextDay}
        onPrevious={onPreviousDay}
        onToday={onToday}
      />

      {children}
    </div>
  );
}

export function DailyOperationsLinkCard({
  description,
  href,
  icon: Icon,
  metric,
  title,
}: {
  description?: string;
  href: string;
  icon: LucideIcon;
  metric?: string;
  title: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="min-h-[108px] rounded-[24px] border-border/70 bg-card shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
        <CardHeader className="space-y-3 p-4">
          <div className="w-fit rounded-2xl bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        {description || metric ? (
          <CardContent className="space-y-2 pt-0">
            {description ? (
              <CardDescription className="text-sm leading-6">{description}</CardDescription>
            ) : null}
            {metric ? <p className="text-sm font-semibold text-primary">{metric}</p> : null}
          </CardContent>
        ) : null}
      </Card>
    </Link>
  );
}
