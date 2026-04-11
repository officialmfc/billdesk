"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ManagerDateNavigator } from "@mfc/manager-ui";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buildDaySellerLedgerRows } from "@/lib/ledger-view-model";
import {
  formatLedgerCurrency,
  useLedgerReadModel,
} from "./shared";

function shiftDate(dateStr: string, amount: number): string {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return format(date, "yyyy-MM-dd");
}

function getTodayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function SellerDayLedgerPage(): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dateStr = searchParams.get("date") || getTodayDateString();
  const { data, error, loading } = useLedgerReadModel();

  const rows = useMemo(() => buildDaySellerLedgerRows(data, dateStr), [data, dateStr]);

  const setDate = (nextDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", nextDate);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Ledger</h1>
          <p className="text-muted-foreground">Day-wise seller chalan register.</p>
        </div>
      </div>

      <ManagerDateNavigator
        dateValue={dateStr}
        onChange={setDate}
        onNext={() => setDate(shiftDate(dateStr, 1))}
        onPrevious={() => setDate(shiftDate(dateStr, -1))}
        onToday={() => setDate(getTodayDateString())}
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Seller Day Sheet</CardTitle>
          <CardDescription>Seller name, selected-date chalan number, amount, and view.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Chalan</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[92px] text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Loading seller ledger...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No seller chalans for this date.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.sellerId}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.todayReference}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatLedgerCurrency(row.todayAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" asChild>
                        <Link href={`/ledgers/sellers/history?userId=${encodeURIComponent(row.sellerId)}`}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
