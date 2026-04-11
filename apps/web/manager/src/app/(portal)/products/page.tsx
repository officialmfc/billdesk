"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Lazy load ProductsList component for better initial load performance
const ProductsList = dynamic(
  () => import("@/components/products/ProductsList").then((mod) => ({
    default: mod.ProductsList,
  })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    ),
  }
);

export default function ProductsPage(): React.ReactElement {
  return <ProductsList />;
}
