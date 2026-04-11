"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Lazy load StockBatchesList component for better initial load performance
const StockBatchesList = dynamic(
  () => import("@/components/stock/StockBatchesList").then((mod) => ({
    default: mod.StockBatchesList,
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

export default function StockPage(): React.ReactElement {
  return <StockBatchesList />;
}
