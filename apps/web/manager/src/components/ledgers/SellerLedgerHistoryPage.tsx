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
  buildSellerLedgerSearchUsers,
  buildSellerHistoryRows,
  getSellerLedgerSummary,
} from "@/lib/ledger-view-model";
import {
  formatLedgerCurrency,
  formatLedgerDate,
  LedgerUserSearchCard,
  useLedgerReadModel,
} from "./shared";

export function SellerLedgerHistoryPage({
  userId,
}: {
  userId: string;
}): React.JSX.Element {
  const { data, error, loading } = useLedgerReadModel();

  const summary = useMemo(() => getSellerLedgerSummary(data, userId), [data, userId]);
  const rows = useMemo(() => buildSellerHistoryRows(data, userId), [data, userId]);
  const searchUsers = useMemo(() => buildSellerLedgerSearchUsers(data), [data]);
  const selectedUser = useMemo(() => data.users.find((user) => user.id === userId), [data.users, userId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {summary?.businessName || selectedUser?.business_name || summary?.name || selectedUser?.name || "Seller History"}
          </h1>
          <p className="text-muted-foreground">Date-wise net payable and payout summary for this seller.</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      {!userId ? (
        <LedgerUserSearchCard
          title="Find seller ledger"
          description="Search a seller to open payout history."
          placeholder="Search seller name or business..."
          targetPath="/ledgers/sellers/history"
          candidateUsers={searchUsers}
        />
      ) : loading ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Loading seller ledger...</CardContent>
        </Card>
      ) : !summary && rows.length === 0 ? (
        <LedgerUserSearchCard
          title="Seller not found"
          description="Search again to open seller payout history."
          emptyMessage="The selected seller could not be loaded."
          placeholder="Search seller name or business..."
          targetPath="/ledgers/sellers/history"
          candidateUsers={searchUsers}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>First column date, then net payable and paid columns.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Net payable</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No seller ledger history.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-medium">{formatLedgerDate(row.date)}</TableCell>
                      <TableCell className="text-right">{formatLedgerCurrency(row.netPayable)}</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatLedgerCurrency(row.paid)}
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
