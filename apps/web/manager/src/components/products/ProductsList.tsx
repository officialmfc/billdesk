"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@mfc/data-access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LocalProduct } from "@mfc/database";

export function ProductsList(): React.JSX.Element {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Use useQuery to fetch products with automatic caching and real-time updates
  const { data: products = [], loading } = useQuery<LocalProduct>('products', {
    orderBy: { field: 'name', direction: 'asc' },
  });

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }, [searchQuery, products]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
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
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => router.push("/products/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">
            {searchQuery ? "No products found" : "No products yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try adjusting your search"
              : "Get started by creating your first product"}
          </p>
          {!searchQuery && (
            <Button onClick={() => router.push("/products/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Product
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
                  <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Description</th>
                  <th className="text-center px-4 py-3 text-sm font-medium">Stock Tracked</th>
                  <th className="text-right px-4 py-3 text-sm font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {product.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {product.is_stock_tracked ? (
                        <Badge variant="default" className="text-xs">Yes</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">No</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                      {new Date(product.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{product.name}</h3>
                  {product.is_stock_tracked ? (
                    <Badge variant="default" className="text-xs">Tracked</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Not Tracked</Badge>
                  )}
                </div>
                {product.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {product.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(product.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
