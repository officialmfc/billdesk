"use client";

import { useMemo } from "react";

import { CustomerBillPrintContent } from "@/components/print/PrintPages";
import { PrintPreviewDialog } from "@/components/print/PrintPreviewDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  buildCustomerLedgerSearchUsers,
  getCustomerBillDetail,
  getCustomerLedgerSummary,
} from "@/lib/ledger-view-model";
import {
  formatLedgerCurrency,
  formatLedgerDate,
  LedgerUserSearchCard,
  useLedgerReadModel,
} from "./shared";

export function CustomerLedgerBillPage({
  billId,
  userId,
}: {
  billId: string;
  userId: string;
}): React.JSX.Element {
  const { data, error, loading } = useLedgerReadModel();

  const summary = useMemo(() => getCustomerLedgerSummary(data, userId), [data, userId]);
  const bill = useMemo(() => getCustomerBillDetail(data, userId, billId), [data, userId, billId]);
  const searchUsers = useMemo(() => buildCustomerLedgerSearchUsers(data), [data]);
  const selectedUser = useMemo(() => data.users.find((user) => user.id === userId), [data.users, userId]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {bill?.businessName || summary?.businessName || selectedUser?.business_name || summary?.name || selectedUser?.name || "Customer Bill"}
          </h1>
          <p className="text-muted-foreground">Selected bill detail with line items and due summary.</p>
          </div>
          {bill ? (
            <PrintPreviewDialog
              previewTitle="Customer bill"
              description="Preview the printable bill."
              documentTitle="Customer Bill"
              paper="thermal"
              trigger={<Button variant="outline">Print bill</Button>}
            >
              <CustomerBillPrintContent bill={bill} />
            </PrintPreviewDialog>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      {!userId ? (
        <LedgerUserSearchCard
          title="Find customer"
          description="Search a customer ledger first, then open a bill from detail."
          placeholder="Search customer name or business..."
          targetPath="/ledgers/customers/detail"
          candidateUsers={searchUsers}
        />
      ) : loading ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Loading bill detail...</CardContent>
        </Card>
      ) : !summary && !bill ? (
        <LedgerUserSearchCard
          title="Customer not found"
          description="Pick a customer to continue to the ledger detail flow."
          emptyMessage="The selected customer was not found."
          placeholder="Search customer name or business..."
          targetPath="/ledgers/customers/detail"
          candidateUsers={searchUsers}
        />
      ) : !billId || !bill ? (
        <Card>
          <CardHeader>
            <CardTitle>Select a bill</CardTitle>
            <CardDescription>Open a bill from the customer detail page to see item-wise detail.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Open a bill from the customer detail page to continue.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>{bill.billNumber}</CardTitle>
              <CardDescription>{formatLedgerDate(bill.date)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[72px]">SL</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Weight</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bill.lines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No line items found for this bill.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bill.lines.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.serialNo}</TableCell>
                        <TableCell>{row.productLabel}</TableCell>
                        <TableCell className="text-right">{row.weightKg.toFixed(2)} kg</TableCell>
                        <TableCell className="text-right">{formatLedgerCurrency(row.rate)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatLedgerCurrency(row.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow>
                    <TableCell />
                    <TableCell className="font-semibold">Total</TableCell>
                    <TableCell className="text-right font-semibold">{bill.totalWeight.toFixed(2)} kg</TableCell>
                    <TableCell />
                    <TableCell className="text-right font-semibold">
                      {formatLedgerCurrency(bill.totalAmount)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="grid gap-2 border-t pt-4 text-sm sm:max-w-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bill amount</span>
                  <span className="font-medium">{formatLedgerCurrency(bill.totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-medium text-green-600">{formatLedgerCurrency(bill.amountPaid)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Due</span>
                  <span className="font-semibold text-red-600">{formatLedgerCurrency(bill.dueAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
