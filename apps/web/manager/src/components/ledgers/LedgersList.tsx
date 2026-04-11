"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildCustomerLedgerSummaries,
  buildSellerLedgerSummaries,
  type LedgerTab,
} from "@/lib/ledger-view-model";
import {
  formatLedgerCurrency,
  formatLedgerDate,
  LedgerNav,
  LedgerMetric,
  useLedgerReadModel,
} from "./shared";

export function LedgersList({
  initialTab = "customer",
  lockTab = false,
}: {
  initialTab?: LedgerTab;
  lockTab?: boolean;
} = {}): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<LedgerTab>(initialTab);
  const { data, error, loading } = useLedgerReadModel();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const customerLedgers = useMemo(
    () => buildCustomerLedgerSummaries(data, searchQuery),
    [data, searchQuery]
  );
  const sellerLedgers = useMemo(
    () => buildSellerLedgerSummaries(data, searchQuery),
    [data, searchQuery]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ledgers</h1>
          <p className="text-muted-foreground">Day, customer, and seller ledger views.</p>
        </div>
        <LedgerNav />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <LedgerMetric
          label="Customer due"
          tone="danger"
          value={formatLedgerCurrency(customerLedgers.reduce((sum, row) => sum + row.currentDue, 0))}
        />
        <LedgerMetric
          label="Seller due"
          tone="danger"
          value={formatLedgerCurrency(sellerLedgers.reduce((sum, row) => sum + row.currentDue, 0))}
        />
        <LedgerMetric
          label="Open ledger accounts"
          value={String(
            customerLedgers.filter((row) => row.currentDue > 0).length +
              sellerLedgers.filter((row) => row.currentDue > 0).length
          )}
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as LedgerTab)}
        className="space-y-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "customer" ? "Search customer ledger..." : "Search seller ledger..."}
              className="pl-8"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          {!lockTab ? (
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="customer">Customer Ledgers</TabsTrigger>
              <TabsTrigger value="seller">Seller Ledgers</TabsTrigger>
            </TabsList>
          ) : null}
        </div>

        <TabsContent value="customer">
          <Card>
            <CardHeader>
              <CardTitle>Customer Ledgers</CardTitle>
              <CardDescription>
                Open `History` for date-wise bill/payment rows or `Detail` for purchase and payment history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead className="text-right">Total billed</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    <TableHead>Last payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        Loading ledgers...
                      </TableCell>
                    </TableRow>
                  ) : customerLedgers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        No customer ledgers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customerLedgers.map((ledger) => (
                      <TableRow key={ledger.userId}>
                        <TableCell className="font-medium">{ledger.name}</TableCell>
                        <TableCell>{ledger.businessName || "-"}</TableCell>
                        <TableCell className="text-right">{formatLedgerCurrency(ledger.totalAmount)}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatLedgerCurrency(ledger.paidAmount)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatLedgerCurrency(ledger.currentDue)}
                        </TableCell>
                        <TableCell>
                          {ledger.lastPaymentDate ? (
                            <span className="text-sm text-muted-foreground">
                              {formatLedgerDate(ledger.lastPaymentDate)}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">No payment</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/ledgers/customers/history?userId=${encodeURIComponent(ledger.userId)}`}>
                                History
                              </Link>
                            </Button>
                            <Button size="sm" asChild>
                              <Link href={`/ledgers/customers/detail?userId=${encodeURIComponent(ledger.userId)}`}>
                                Detail
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seller">
          <Card>
            <CardHeader>
              <CardTitle>Seller Ledgers</CardTitle>
              <CardDescription>
                Open history to see date-wise net payable and paid values.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead className="text-right">Net payable total</TableHead>
                    <TableHead className="text-right">Paid out</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    <TableHead>Last payout</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        Loading ledgers...
                      </TableCell>
                    </TableRow>
                  ) : sellerLedgers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        No seller ledgers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sellerLedgers.map((ledger) => (
                      <TableRow key={ledger.userId}>
                        <TableCell className="font-medium">{ledger.name}</TableCell>
                        <TableCell>{ledger.businessName || "-"}</TableCell>
                        <TableCell className="text-right">{formatLedgerCurrency(ledger.totalAmount)}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatLedgerCurrency(ledger.paidAmount)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatLedgerCurrency(ledger.currentDue)}
                        </TableCell>
                        <TableCell>
                          {ledger.lastPaymentDate ? (
                            <span className="text-sm text-muted-foreground">
                              {formatLedgerDate(ledger.lastPaymentDate)}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">No payout</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/ledgers/sellers/history?userId=${encodeURIComponent(ledger.userId)}`}>
                              History
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
