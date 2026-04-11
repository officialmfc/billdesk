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
import {
  buildDayCustomerLedgerRows,
  buildDaySellerLedgerRows,
} from "@/lib/ledger-view-model";
import { formatLedgerCurrency, LedgerNav, useLedgerReadModel } from "./shared";

function shiftDate(dateStr: string, amount: number): string {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return format(date, "yyyy-MM-dd");
}

function getTodayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function DayLedgerPage(): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dateStr = searchParams.get("date") || getTodayDateString();
  const { data, error, loading } = useLedgerReadModel();

  const customerRows = useMemo(() => buildDayCustomerLedgerRows(data, dateStr), [data, dateStr]);
  const sellerRows = useMemo(() => buildDaySellerLedgerRows(data, dateStr), [data, dateStr]);

  const setDate = (nextDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", nextDate);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Day Ledger</h1>
          <p className="text-muted-foreground">Selected-day sheets with view links into customer and seller ledgers.</p>
        </div>
        <LedgerNav />
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
          <CardTitle>Customer Sheet</CardTitle>
          <CardDescription>Name, today bill, last two older dues, payment today, and view.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Today</TableHead>
                <TableHead>Older dues</TableHead>
                <TableHead className="text-right">Payment today</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Loading day ledger...
                  </TableCell>
                </TableRow>
              ) : customerRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No customer sheet rows for this date.
                  </TableCell>
                </TableRow>
              ) : (
                customerRows.map((row) => (
                  <TableRow key={row.customerId}>
                    <TableCell>
                      <div className="font-medium">{row.businessName || row.name}</div>
                      <div className="text-xs text-muted-foreground">{row.businessName ? row.name : "Customer account"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{row.todayReference}</div>
                      <div className="text-xs text-muted-foreground">{formatLedgerCurrency(row.todayAmount)}</div>
                    </TableCell>
                    <TableCell>
                      {row.olderDues.length ? (
                        <div className="flex flex-wrap gap-2">
                          {row.olderDues.map((entry) => (
                            <span key={entry.reference} className="rounded-full border bg-muted px-3 py-1 text-xs font-medium">
                              {formatLedgerCurrency(entry.amount)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatLedgerCurrency(row.paymentToday)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" asChild>
                        <Link href={`/ledgers/customers/detail?userId=${encodeURIComponent(row.customerId)}`}>
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

      <Card>
        <CardHeader>
          <CardTitle>Seller Sheet</CardTitle>
          <CardDescription>Selected-day chalans with older due chips and seller history access.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Today</TableHead>
                <TableHead>Older dues</TableHead>
                <TableHead className="text-right">Paid today</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Loading day ledger...
                  </TableCell>
                </TableRow>
              ) : sellerRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No seller sheet rows for this date.
                  </TableCell>
                </TableRow>
              ) : (
                sellerRows.map((row) => (
                  <TableRow key={row.sellerId}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      <div className="font-medium">{row.todayReference}</div>
                      <div className="text-xs text-muted-foreground">{formatLedgerCurrency(row.todayAmount)}</div>
                    </TableCell>
                    <TableCell>
                      {row.olderDues.length ? (
                        <div className="flex flex-wrap gap-2">
                          {row.olderDues.map((entry) => (
                            <span key={entry.reference} className="rounded-full border bg-muted px-3 py-1 text-xs font-medium">
                              {formatLedgerCurrency(entry.amount)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatLedgerCurrency(row.paymentToday)}
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
