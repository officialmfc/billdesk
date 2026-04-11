"use client";

import Link from "next/link";
import { useMemo } from "react";

import { CustomerLedgerDetailPrintContent } from "@/components/print/PrintPages";
import { PrintPreviewDialog } from "@/components/print/PrintPreviewDialog";
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
  buildCustomerLedgerSearchUsers,
  buildCustomerPurchaseRows,
  getCustomerLedgerSummary,
} from "@/lib/ledger-view-model";
import {
  formatLedgerCurrency,
  formatLedgerDate,
  LedgerUserSearchCard,
  useLedgerReadModel,
} from "./shared";

export function CustomerLedgerDetailPage({
  userId,
}: {
  userId: string;
}): React.JSX.Element {
  const { data, error, loading } = useLedgerReadModel();

  const summary = useMemo(() => getCustomerLedgerSummary(data, userId), [data, userId]);
  const purchaseRows = useMemo(() => buildCustomerPurchaseRows(data, userId), [data, userId]);
  const searchUsers = useMemo(() => buildCustomerLedgerSearchUsers(data), [data]);
  const selectedUser = useMemo(() => data.users.find((user) => user.id === userId), [data.users, userId]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {summary?.businessName || selectedUser?.business_name || summary?.name || selectedUser?.name || "Customer Detail"}
          </h1>
          <p className="text-muted-foreground">Day-wise purchase ledger with bill-level detail links.</p>
          </div>
          {userId ? (
            <PrintPreviewDialog
              previewTitle="Customer detail sheet"
              description="Preview the printable customer detail ledger."
              documentTitle="Customer Ledger"
              paper="thermal"
              trigger={<Button variant="outline">Print sheet</Button>}
            >
              <CustomerLedgerDetailPrintContent
                customerLabel={
                  summary?.businessName ||
                  selectedUser?.business_name ||
                  summary?.name ||
                  selectedUser?.name ||
                  "Customer Ledger"
                }
                paper="thermal"
                rows={purchaseRows}
              />
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
          title="Find customer ledger"
          description="Search a customer to open the detail ledger."
          placeholder="Search customer name or business..."
          targetPath="/ledgers/customers/detail"
          candidateUsers={searchUsers}
        />
      ) : loading ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Loading customer detail...</CardContent>
        </Card>
      ) : !summary && purchaseRows.length === 0 ? (
        <LedgerUserSearchCard
          title="Customer not found"
          description="Search again to open a customer detail ledger."
          emptyMessage="The selected customer could not be loaded."
          placeholder="Search customer name or business..."
          targetPath="/ledgers/customers/detail"
          candidateUsers={searchUsers}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Purchase Ledger</CardTitle>
            <CardDescription>Date, amount, paid, due, and bill detail access.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                  <TableHead className="w-[96px] text-right">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No purchase history for this customer.
                    </TableCell>
                  </TableRow>
                ) : (
                  purchaseRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{formatLedgerDate(row.date)}</TableCell>
                      <TableCell className="text-right">{formatLedgerCurrency(row.totalAmount)}</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatLedgerCurrency(row.paidAmount)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatLedgerCurrency(row.dueAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" asChild>
                          <Link
                            href={`/ledgers/customers/bill?userId=${encodeURIComponent(userId)}&billId=${encodeURIComponent(row.id)}`}
                          >
                            Detail
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
      )}
    </div>
  );
}
