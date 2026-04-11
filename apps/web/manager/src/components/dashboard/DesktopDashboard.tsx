import Link from "next/link";

import { navigationItems, settingsItem } from "@/config/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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

export function DesktopDashboard(): React.ReactElement {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Fallback Hub
        </div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="max-w-3xl text-muted-foreground">
          This is the fallback manager hub. Use it when you want a quick map of every section, and
          change the default landing later from Settings.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {primaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="group">
              <Card className="h-full rounded-[24px] transition-colors group-hover:bg-accent/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="rounded-[24px]">
        <CardHeader>
          <CardTitle>What To Use When</CardTitle>
          <CardDescription>Keep the primary flow simple and use the rest only when needed.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {secondaryItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-start gap-3 rounded-2xl border p-4 transition-colors hover:bg-accent/20"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button asChild variant="outline">
          <Link href="/settings">Change default landing in Settings</Link>
        </Button>
      </div>
    </div>
  );
}
