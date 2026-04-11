"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ManagerDateNavigator } from "@mfc/manager-ui";
import { format } from "date-fns";

import { CreateCustomerPaymentDialog } from "@/components/payments/CreateCustomerPaymentDialog";
import { PrintPreviewDialog } from "@/components/print/PrintPreviewDialog";
import { CustomerDayLedgerPrintContent } from "@/components/print/PrintPages";
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
import { buildDayCustomerLedgerSections } from "@/lib/ledger-view-model";
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

function renderOldDueCell(amounts: number[]): React.JSX.Element {
  if (amounts.length === 0) {
    return <span className="text-sm text-muted-foreground">-</span>;
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {amounts.map((amount, index) => (
        <span
          key={`${amount}-${index}`}
          className="rounded-full border bg-muted px-3 py-1 text-xs font-medium"
        >
          {formatLedgerCurrency(amount)}
        </span>
      ))}
    </div>
  );
}

export function CustomerDayLedgerPage(): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dateStr = searchParams.get("date") || getTodayDateString();
  const { data, error, loading, refetch } = useLedgerReadModel();

  const sections = useMemo(() => buildDayCustomerLedgerSections(data, dateStr), [data, dateStr]);

  const setDate = (nextDate: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", nextDate);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Ledger</h1>
          <p className="text-muted-foreground">Day-wise customer due register with inline payment actions.</p>
          </div>
          <PrintPreviewDialog
            previewTitle="Customer day ledger"
            description="Preview the printable customer day sheet."
            documentTitle="Ledger Sheet"
            headerMode="compact"
            paper="a4"
            trigger={<Button variant="outline">Print sheet</Button>}
          >
            <CustomerDayLedgerPrintContent date={dateStr} sections={sections} />
          </PrintPreviewDialog>
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
          <CardTitle>Purchased Today</CardTitle>
          <CardDescription>Customers with purchases on the selected date.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Old</TableHead>
                <TableHead className="text-right">Today</TableHead>
                <TableHead className="text-right">Total (due)</TableHead>
                <TableHead className="text-right">Payment (today)</TableHead>
                <TableHead className="w-[72px] text-center">+</TableHead>
                <TableHead className="w-[92px] text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Loading customer ledger...
                  </TableCell>
                </TableRow>
              ) : sections.purchasedToday.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No customer purchases for this date.
                  </TableCell>
                </TableRow>
              ) : (
                sections.purchasedToday.map((row) => (
                  <TableRow key={row.customerId}>
                    <TableCell className="font-medium">{row.displayName}</TableCell>
                    <TableCell className="text-right">
                      {renderOldDueCell(row.olderDues.map((entry) => entry.amount))}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {row.todayAmount > 0 ? formatLedgerCurrency(row.todayAmount) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      {row.outstandingAtClose > 0 ? formatLedgerCurrency(row.outstandingAtClose) : "-"}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {row.paymentToday > 0 ? formatLedgerCurrency(row.paymentToday) : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.outstandingAtClose > 0 ? (
                        <CreateCustomerPaymentDialog
                          onSuccess={refetch}
                          presetCustomerId={row.customerId}
                          presetCustomerName={row.displayName}
                          presetPaymentDate={new Date(`${dateStr}T00:00:00`)}
                          triggerLabel="+"
                          triggerSize="sm"
                          triggerVariant="outline"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
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
          <CardTitle>Due, No Purchase Today</CardTitle>
          <CardDescription>Customers with older due but no purchase on the selected date.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Old</TableHead>
                <TableHead className="text-right">Total (due)</TableHead>
                <TableHead className="text-right">Payment (today)</TableHead>
                <TableHead className="w-[72px] text-center">+</TableHead>
                <TableHead className="w-[92px] text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading customer ledger...
                  </TableCell>
                </TableRow>
              ) : sections.dueOnly.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No carry-forward customer due for this date.
                  </TableCell>
                </TableRow>
              ) : (
                sections.dueOnly.map((row) => (
                  <TableRow key={row.customerId}>
                    <TableCell className="font-medium">{row.displayName}</TableCell>
                    <TableCell className="text-right">
                      {renderOldDueCell(row.olderDues.map((entry) => entry.amount))}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      {row.outstandingAtClose > 0 ? formatLedgerCurrency(row.outstandingAtClose) : "-"}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {row.paymentToday > 0 ? formatLedgerCurrency(row.paymentToday) : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.outstandingAtClose > 0 ? (
                        <CreateCustomerPaymentDialog
                          onSuccess={refetch}
                          presetCustomerId={row.customerId}
                          presetCustomerName={row.displayName}
                          presetPaymentDate={new Date(`${dateStr}T00:00:00`)}
                          triggerLabel="+"
                          triggerSize="sm"
                          triggerVariant="outline"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
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
    </div>
  );
}
