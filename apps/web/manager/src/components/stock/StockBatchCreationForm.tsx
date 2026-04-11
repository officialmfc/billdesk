"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { useMutation } from "@mfc/data-access";
import { createClient } from "@mfc/supabase-config";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MfcStaffAutocomplete } from "./MfcStaffAutocomplete";
import { ProductAutocomplete } from "./ProductAutocomplete";
import { SupplierAutocomplete } from "./SupplierAutocomplete";

type StockBatchRow = {
  id: string;
  productName: string;
  productId: string | null;
  mfcStaffName: string;
  mfcStaffId: string | null;
  supplierName: string;
  supplierId: string | null;
  initialWeight: string;
  costPerKg: string;
};

export function StockBatchCreationForm(): React.JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const [batches, setBatches] = useState<StockBatchRow[]>([]);
  const [mounted, setMounted] = useState(false);
  const batchIdCounter = useRef(0);

  const weightRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const costRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const { mutate, loading: saving } = useMutation('stock_batches');

  // Removed database check that was causing IndexedDB errors

  const addBatch = useCallback(() => {
    batchIdCounter.current += 1;
    const newBatch: StockBatchRow = {
      id: `batch-${batchIdCounter.current}`,
      productName: "",
      productId: null,
      mfcStaffName: "",
      mfcStaffId: null,
      supplierName: "",
      supplierId: null,
      initialWeight: "",
      costPerKg: "",
    };
    setBatches((prev) => [...prev, newBatch]);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && batches.length === 0) {
      addBatch();
    }
  }, [mounted, batches.length, addBatch]);

  const removeBatch = (id: string) => {
    setBatches(batches.filter((b) => b.id !== id));
  };

  const updateBatch = (id: string, field: keyof StockBatchRow, value: any) => {
    logger.info({ id, field, value }, 'updateBatch called');
    setBatches((prevBatches) => {
      const updated = prevBatches.map((b) => (b.id === id ? { ...b, [field]: value } : b));
      logger.info({ updated }, 'Batches updated');
      return updated;
    });
  };

  const handleSubmit = async () => {
    const validBatches = batches.filter(
      (b) =>
        (b.productId || b.productName) && // Allow either productId OR productName for new products
        b.mfcStaffId &&
        b.initialWeight &&
        parseFloat(b.initialWeight) > 0
    );

    if (validBatches.length === 0) {
      toast({
        title: "Validation Error",
        description:
          "Please add at least one batch with product, assigned staff, and weight",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = validBatches.map((b) => {
        const initialWeight = parseFloat(b.initialWeight);
        return {
          product_id: b.productId,
          product_name: b.productName, // Include product name for auto-creation
          mfc_seller_id: b.mfcStaffId,
          supplier_id: b.supplierId || null,
          initial_weight_kg: initialWeight,
          current_weight_kg: initialWeight, // Initially same as initial weight
          cost_per_kg: b.costPerKg ? parseFloat(b.costPerKg) : null,
        };
      });

      // For RPC functions, we still need to use Supabase client directly
      // as the DAL doesn't support RPC yet
      const supabase = createClient();
      const { data, error } = await supabase.rpc("create_stock_batches", {
        p_batches: payload,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `${data.count} batch(es) created successfully!`,
      });

      router.push("/stock");
    } catch (error: any) {
      logger.error(error, '❌ Stock batch creation error');
      toast({
        title: "Error",
        description: error.message || "Failed to create batches",
        variant: "destructive",
      });
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9" />
          <div className="flex-1">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold">
            Add New Stock Batches
          </h1>
          <p className="text-sm text-muted-foreground">
            Add physical inventory to the system
          </p>
        </div>
      </div>

      <div className="border border-border rounded-lg p-4 md:p-6 bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Batches ({batches.length})</h3>
          <Button onClick={addBatch} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Batch
          </Button>
        </div>

        <div className="space-y-3">
          {batches.map((batch, index) => (
            <div
              key={batch.id}
              className="border border-border rounded-lg p-3 bg-muted/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  #{index + 1}
                </Badge>
                {batches.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBatch(batch.id)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Product *
                  </label>
                  <ProductAutocomplete
                    value={batch.productName}
                    onChange={(name, id) => {
                      logger.info({ name, id }, "Product changed");
                      updateBatch(batch.id, "productName", name);
                      updateBatch(batch.id, "productId", id);
                    }}
                    onEnterKey={() => weightRefs.current[batch.id]?.focus()}
                    placeholder="Search or create product..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Assign to Staff *
                  </label>
                  <MfcStaffAutocomplete
                    value={batch.mfcStaffName}
                    onChange={(staffName, staffId) => {
                      updateBatch(batch.id, "mfcStaffName", staffName);
                      updateBatch(batch.id, "mfcStaffId", staffId);
                    }}
                    placeholder="Search staff..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Supplier (Optional)
                  </label>
                  <SupplierAutocomplete
                    value={batch.supplierName}
                    onChange={(name, id) => {
                      updateBatch(batch.id, "supplierName", name);
                      updateBatch(batch.id, "supplierId", id);
                    }}
                    onEnterKey={() => weightRefs.current[batch.id]?.focus()}
                    placeholder="Search supplier..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Initial Weight (kg) *
                  </label>
                  <Input
                    ref={(el) => {
                      weightRefs.current[batch.id] = el;
                    }}
                    type="number"
                    inputMode="decimal"
                    value={batch.initialWeight}
                    onChange={(e) =>
                      updateBatch(batch.id, "initialWeight", e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        costRefs.current[batch.id]?.focus();
                      }
                    }}
                    placeholder="0.00"
                    className="h-9"
                    enterKeyHint="next"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Cost per kg (Optional)
                  </label>
                  <Input
                    ref={(el) => {
                      costRefs.current[batch.id] = el;
                    }}
                    type="number"
                    inputMode="decimal"
                    value={batch.costPerKg}
                    onChange={(e) =>
                      updateBatch(batch.id, "costPerKg", e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const currentBatch = batches.find(
                          (b) => b.id === batch.id
                        );
                        if (
                          currentBatch &&
                          currentBatch.productId &&
                          currentBatch.mfcStaffId &&
                          currentBatch.initialWeight
                        ) {
                          addBatch();
                        }
                      }
                    }}
                    placeholder="0.00"
                    className="h-9"
                    enterKeyHint="done"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={() => {
            logger.info({ batches }, 'Save button clicked, current batches');
            handleSubmit();
          }}
          disabled={saving || batches.length === 0}
          className="w-full h-11"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Batches
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => router.back()}
          className="w-full h-11"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
