"use client";

import { useMemo } from "react";

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
  buildCustomerHistoryRows,
  getCustomerLedgerSummary,
} from "@/lib/ledger-view-model";
import {
  formatLedgerCurrency,
  formatLedgerDate,
  LedgerUserSearchCard,
  useLedgerReadModel,
} from "./shared";

export function CustomerLedgerHistoryPage({
  userId,
}: {
  userId: string;
}): React.JSX.Element {
  const { data, error, loading } = useLedgerReadModel();

  const summary = useMemo(() => getCustomerLedgerSummary(data, userId), [data, userId]);
  const rows = useMemo(() => buildCustomerHistoryRows(data, userId), [data, userId]);
  const searchUsers = useMemo(() => buildCustomerLedgerSearchUsers(data), [data]);
  const selectedUser = useMemo(() => data.users.find((user) => user.id === userId), [data.users, userId]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {summary?.businessName || selectedUser?.business_name || summary?.name || selectedUser?.name || "Customer History"}
          </h1>
          <p className="text-muted-foreground">Date-wise billed and payment summary for this customer.</p>
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
          description="Search a customer to open date-wise bill and payment history."
          placeholder="Search customer name or business..."
          targetPath="/ledgers/customers/history"
          candidateUsers={searchUsers}
        />
      ) : loading ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Loading customer ledger...</CardContent>
        </Card>
      ) : !summary && rows.length === 0 ? (
        <LedgerUserSearchCard
          title="Customer not found"
          description="Search again to open customer history."
          emptyMessage="The selected customer could not be loaded."
          placeholder="Search customer name or business..."
          targetPath="/ledgers/customers/history"
          candidateUsers={searchUsers}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>First column date, then billed amount and payment amount.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Bill</TableHead>
                  <TableHead className="text-right">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No customer ledger history.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-medium">{formatLedgerDate(row.date)}</TableCell>
                      <TableCell className="text-right">{formatLedgerCurrency(row.billed)}</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatLedgerCurrency(row.payment)}
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
