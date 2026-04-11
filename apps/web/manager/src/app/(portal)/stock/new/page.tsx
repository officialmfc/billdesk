"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Lazy load StockBatchCreationForm for better performance
const StockBatchCreationForm = dynamic(
  () => import("@/components/stock/StockBatchCreationForm").then((mod) => ({
    default: mod.StockBatchCreationForm,
  })),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    ),
  }
);

export default function NewStockBatchPage(): React.ReactElement {
  return <StockBatchCreationForm />;
}
