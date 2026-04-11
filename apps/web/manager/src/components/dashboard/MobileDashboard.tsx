import Link from "next/link";

import { navigationItems, settingsItem } from "@/config/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const primaryHrefs = [
  "/sales",
  "/operations",
  "/ledgers",
  "/payments",
] as const;

const primaryItems = primaryHrefs
  .map((href) => navigationItems.find((item) => item.href === href))
  .filter((item): item is NonNullable<typeof item> => Boolean(item));

const secondaryItems = [
  ...navigationItems.filter(
    (item) => !primaryHrefs.includes(item.href as (typeof primaryHrefs)[number]) && item.href !== "/dashboard"
  ),
  settingsItem,
];

export function MobileDashboard(): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Fallback Hub
        </p>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Quick access to sales, bill &amp; chalan, ledgers, payments, and the remaining tools.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {primaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <Card className="h-full rounded-[24px]">
                <CardContent className="space-y-3 p-4">
                  <div className="w-fit rounded-full bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="rounded-[24px]">
        <CardHeader>
          <CardTitle className="text-base">More Tools</CardTitle>
          <CardDescription>Use these when the main tab flow is not enough.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {secondaryItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-start gap-3 rounded-2xl border p-3 transition-colors hover:bg-accent/20"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
