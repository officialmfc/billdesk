"use client";

import Link from "next/link";
import { BookCopy, FileClock, FileSpreadsheet, History, ReceiptText, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const customerCards = [
  {
    title: "Customer Day",
    description: "Selected-date customer sheet with today due, old due, payment, add payment, and view.",
    href: "/ledgers/customers/day",
    icon: FileSpreadsheet,
  },
  {
    title: "Customer Detail",
    description: "Day-wise purchase ledger with amount, paid, due, and bill detail links.",
    href: "/ledgers/customers/detail",
    icon: ReceiptText,
  },
  {
    title: "Customer History",
    description: "Date-wise billed and payment history for one customer.",
    href: "/ledgers/customers/history",
    icon: History,
  },
] as const;

const sellerCards = [
  {
    title: "Seller Day",
    description: "Selected-date seller sheet with chalan reference, amount, and view.",
    href: "/ledgers/sellers/day",
    icon: Users,
  },
  {
    title: "Seller History",
    description: "Date-wise net payable and payout history for one seller.",
    href: "/ledgers/sellers/history",
    icon: FileClock,
  },
] as const;

function LedgerDeskSection({
  cards,
  description,
  title,
}: {
  cards: readonly {
    title: string;
    description: string;
    href: string;
    icon: typeof BookCopy;
  }[];
  description: string;
  title: string;
}): React.JSX.Element {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.href} href={card.href} className="group">
              <Card className="h-full rounded-[24px] shadow-sm transition-colors group-hover:bg-accent/30">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function LedgerOverviewPage(): React.JSX.Element {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Ledger Desk
        </div>
        <h1 className="text-3xl font-bold">Ledgers</h1>
        <p className="max-w-3xl text-muted-foreground">
          Open the right ledger sheet first, then move into customer or seller detail and history.
        </p>
      </div>

      <LedgerDeskSection
        title="Customers"
        description="Use the customer day sheet for operations, then move into detail or history."
        cards={customerCards}
      />

      <LedgerDeskSection
        title="Sellers"
        description="Use seller day for selected-date chalans and history for payout follow-up."
        cards={sellerCards}
      />

      <Card className="rounded-[24px]">
        <CardContent className="space-y-2 p-5">
          <div className="text-sm font-semibold text-foreground">Default landing</div>
          <div className="text-sm text-muted-foreground">
            The app can still land directly on Customer Day from Settings, even though the main
            ledger nav now opens this desk.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
