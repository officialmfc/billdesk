/**
 * Inventory Page
 * Manage products and inventory
 */

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { ArrowRight, Package, PackagePlus } from "lucide-react";
import Link from "next/link";

export default function InventoryPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          Manage your product catalog and stock batches
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/products">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Product Catalog
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Products</div>
              <p className="text-xs text-muted-foreground mt-1">
                Manage product definitions, prices, and details
              </p>
              <div className="mt-4 flex items-center text-sm text-primary font-medium">
                View Products <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/stock">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Stock Batches
              </CardTitle>
              <PackagePlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Stock</div>
              <p className="text-xs text-muted-foreground mt-1">
                Track inventory batches, quantities, and suppliers
              </p>
              <div className="mt-4 flex items-center text-sm text-primary font-medium">
                Manage Stock <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/products/new"
              className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors"
            >
              <span className="text-sm font-medium">Add New Product</span>
              <Plus className="h-4 w-4" />
            </Link>
            <Link
              href="/stock/new"
              className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors"
            >
              <span className="text-sm font-medium">Add Stock Batch</span>
              <Plus className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
