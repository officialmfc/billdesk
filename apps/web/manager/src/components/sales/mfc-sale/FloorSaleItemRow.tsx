"use client";

import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, PlusCircle } from "lucide-react";
import { MfcStaffAutocomplete } from "../shared/MfcStaffAutocomplete";
import { UserAutocomplete } from "../auction-sale/UserAutocomplete";
import { StockBatchAutocomplete } from "../shared/StockBatchAutocomplete";
import type { FloorSaleItem } from "./types";

interface FloorSaleItemRowProps {
  item: FloorSaleItem;
  index: number;
  updateItem: (
    id: string,
    field: keyof FloorSaleItem,
    value: string | number | null
  ) => void;
  removeItem: (id: string) => void;
  addItem: (afterId: string) => void;
  handleSellerEnter: (itemId: string) => void;
  handleBuyerEnter: (itemId: string) => void;
  handleProductEnter: (itemId: string) => void;
  handleWeightEnter: (itemId: string) => void;
  handleRateEnter: (itemId: string) => void;
  assignRef: (
    type: "seller" | "buyer" | "product" | "weight" | "rate",
    id: string,
    el: HTMLInputElement | null
  ) => void;
  isFirstItem: boolean;
}

export const FloorSaleItemRow: React.NamedExoticComponent<FloorSaleItemRowProps> = memo(
  ({
    item,
    index,
    updateItem,
    removeItem,
    addItem,
    handleSellerEnter,
    handleBuyerEnter,
    handleProductEnter,
    handleWeightEnter,
    handleRateEnter,
    assignRef,
    isFirstItem,
  }: FloorSaleItemRowProps) => {
    return (
      <div className="flex gap-1 rounded-lg border border-border/80 bg-muted/40 p-2 transition-shadow hover:shadow-sm">
        <div className="sticky left-0 flex flex-col items-center justify-between gap-1.5 py-1">
          <Badge
            variant="secondary"
            className="flex h-5 w-5 items-center justify-center text-xs font-bold"
          >
            {index + 1}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addItem(item.id)}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
            title="Add item below"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-2">
          {/* First row: Seller and Buyer */}
          <div className="flex items-start gap-1">
            <div className="flex-1 min-w-0">
              <MfcStaffAutocomplete
                value={item.mfcSellerName}
                onChange={(name, staffId) => {
                  updateItem(item.id, "mfcSellerName", name);
                  updateItem(item.id, "mfcSellerId", staffId);
                }}
                onEnterKey={() => handleSellerEnter(item.id)}
                placeholder="MFC Seller..."
                inputRef={(el) => assignRef("seller", item.id, el)}
                autoFocus={isFirstItem}
              />
            </div>
            <div className="flex-1 min-w-0">
              <UserAutocomplete
                value={item.buyerName}
                onChange={(name, userId) => {
                  updateItem(item.id, "buyerName", name);
                  updateItem(item.id, "buyerId", userId);
                }}
                onEnterKey={() => handleBuyerEnter(item.id)}
                placeholder="Buyer..."
                inputRef={(el) => assignRef("buyer", item.id, el)}
              />
            </div>
          </div>

          {/* Second row: Product and Delete button */}
          <div className="flex items-center gap-1">
            <div className="flex-1 min-w-0">
              <StockBatchAutocomplete
                value={item.productName}
                onChange={(name, productId, batchId) => {
                  updateItem(item.id, "productName", name);
                  updateItem(item.id, "productId", productId);
                  updateItem(item.id, "stockBatchId", batchId);
                }}
                onEnterKey={() => handleProductEnter(item.id)}
                placeholder="Product/Batch..."
                inputRef={(el) => assignRef("product", item.id, el)}
                mfcSellerId={item.mfcSellerId}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(item.id)}
              className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
              title="Delete item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Third row: Weight, Rate, Total */}
          <div className="grid grid-cols-12 items-center gap-1">
            <div className="col-span-3 min-w-0">
              <Input
                ref={(el) => assignRef("weight", item.id, el)}
                type="number"
                inputMode="decimal"
                step="0.01"
                value={item.weight || ""}
                onChange={(e) =>
                  updateItem(item.id, "weight", parseFloat(e.target.value) || 0)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleWeightEnter(item.id);
                  }
                }}
                placeholder="Qty"
                className="h-9 px-1 text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                enterKeyHint="next"
              />
            </div>
            <span className="text-center text-sm font-medium text-muted-foreground">
              ×
            </span>
            <div className="col-span-4 min-w-0">
              <Input
                ref={(el) => assignRef("rate", item.id, el)}
                type="number"
                inputMode="decimal"
                step="0.01"
                value={item.rate || ""}
                onChange={(e) =>
                  updateItem(item.id, "rate", parseFloat(e.target.value) || 0)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleRateEnter(item.id);
                  }
                }}
                placeholder="Rate"
                className="h-9 px-1 text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                enterKeyHint="done"
              />
            </div>
            <span className="text-center text-sm font-medium text-muted-foreground">
              =
            </span>
            <div className="col-span-3 min-w-0 flex items-center">
              <div
                className="flex h-9 w-full items-center truncate font-semibold text-foreground"
                title={`₹${item.total.toFixed(2)}`}
              >
                <span className="text-sm">₹{item.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

FloorSaleItemRow.displayName = "FloorSaleItemRow";
