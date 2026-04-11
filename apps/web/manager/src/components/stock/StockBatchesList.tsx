"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@mfc/data-access";
import { db } from "@mfc/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, PackagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LocalStockBatch, LocalProduct } from "@mfc/database";

type StockBatchWithProduct = LocalStockBatch & {
  product_name?: string;
  supplier_name?: string;
  mfc_seller_name?: string;
};

export function StockBatchesList(): React.JSX.Element {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [enrichedBatches, setEnrichedBatches] = useState<StockBatchWithProduct[]>([]);

  // Use useQuery to fetch stock batches with automatic caching and real-time updates
  const { data: batches = [], loading } = useQuery<LocalStockBatch>('stock_batches', {
    orderBy: { field: 'updated_at', direction: 'desc' },
  });

  // Enrich batches with related data
  useEffect(() => {
    const enrichBatches = async () => {
      if (batches.length === 0) {
        setEnrichedBatches([]);
        return;
      }

      const enriched = await Promise.all(
        batches.map(async (batch) => {
          const product = await db.products.get(batch.product_id);
          const supplier = batch.supplier_id
            ? await db.users.get(batch.supplier_id)
            : null;
          const mfcSeller = batch.mfc_seller_id
            ? await db.mfc_staff.get(batch.mfc_seller_id)
            : null;

          return {
            ...batch,
            product_name: product?.name || "Unknown",
            supplier_name: supplier?.business_name || supplier?.name || undefined,
            mfc_seller_name: mfcSeller?.full_name || undefined,
          };
        })
      );

      setEnrichedBatches(enriched);
    };

    enrichBatches();
  }, [batches]);

  // Filter batches based on search query
  const filteredBatches = useMemo(() => {
    if (!searchQuery.trim()) {
      return enrichedBatches;
    }

    const query = searchQuery.toLowerCase();
    return enrichedBatches.filter(
      (b) =>
        b.product_name?.toLowerCase().includes(query) ||
        b.batch_code?.toLowerCase().includes(query) ||
        b.supplier_name?.toLowerCase().includes(query) ||
        b.mfc_seller_name?.toLowerCase().includes(query)
    );
  }, [searchQuery, enrichedBatches]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Stock Batches</h1>
          <p className="text-sm text-muted-foreground">
            {filteredBatches.length} batch
            {filteredBatches.length !== 1 ? "es" : ""}
          </p>
        </div>
        <Button onClick={() => router.push("/stock/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Batch
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by product, batch code, staff, or supplier..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stock Batches Table */}
      {filteredBatches.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center">
          <PackagePlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">
            {searchQuery ? "No batches found" : "No stock batches yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try adjusting your search"
              : "Get started by adding your first stock batch"}
          </p>
          {!searchQuery && (
            <Button onClick={() => router.push("/stock/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Stock Batch
            </Button>
          )}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium">
                    Batch Code
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium">
                    Assigned To
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium">
                    Supplier
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium">
                    Initial (kg)
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium">
                    Current (kg)
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium">
                    Cost/kg
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBatches.map((batch) => {
                  const percentRemaining =
                    (batch.current_weight_kg / batch.initial_weight_kg) * 100;
                  const isLow = percentRemaining < 20;
                  const isEmpty = batch.current_weight_kg === 0;

                  return (
                    <tr
                      key={batch.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => router.push(`/stock/${batch.id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-sm">
                        {batch.batch_code || "-"}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {batch.product_name}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {batch.mfc_seller_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {batch.supplier_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {batch.initial_weight_kg.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        {batch.current_weight_kg.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {batch.cost_per_kg
                          ? `₹${batch.cost_per_kg.toFixed(2)}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEmpty ? (
                          <Badge variant="secondary" className="text-xs">
                            Empty
                          </Badge>
                        ) : isLow ? (
                          <Badge variant="destructive" className="text-xs">
                            Low
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-xs">
                            Available
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {filteredBatches.map((batch) => {
              const percentRemaining =
                (batch.current_weight_kg / batch.initial_weight_kg) * 100;
              const isLow = percentRemaining < 20;
              const isEmpty = batch.current_weight_kg === 0;

              return (
                <div
                  key={batch.id}
                  className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/stock/${batch.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{batch.product_name}</h3>
                      {batch.batch_code && (
                        <p className="text-xs font-mono text-muted-foreground">
                          {batch.batch_code}
                        </p>
                      )}
                    </div>
                    {isEmpty ? (
                      <Badge variant="secondary" className="text-xs">
                        Empty
                      </Badge>
                    ) : isLow ? (
                      <Badge variant="destructive" className="text-xs">
                        Low
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-xs">
                        Available
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div>
                      <span className="text-muted-foreground">Current:</span>{" "}
                      <span className="font-medium">
                        {batch.current_weight_kg.toFixed(2)} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Initial:</span>{" "}
                      <span>{batch.initial_weight_kg.toFixed(2)} kg</span>
                    </div>
                  </div>

                  {batch.mfc_seller_name && (
                    <p className="text-xs text-muted-foreground mb-1">
                      Assigned to: {batch.mfc_seller_name}
                    </p>
                  )}
                  {batch.supplier_name && (
                    <p className="text-xs text-muted-foreground mb-1">
                      Supplier: {batch.supplier_name}
                    </p>
                  )}
                  {batch.cost_per_kg && (
                    <p className="text-xs text-muted-foreground">
                      Cost: ₹{batch.cost_per_kg.toFixed(2)}/kg
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
