"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";

interface SaleSummaryProps {
  totalAmount: number;
  commissionPercentage: number;
  adjustedCommission: number;
  roundedNetAmount: number;
  setCommissionPercentage: (value: number) => void;
}

export function SaleSummary({
  totalAmount,
  commissionPercentage,
  adjustedCommission,
  roundedNetAmount,
  setCommissionPercentage,
}: SaleSummaryProps): React.JSX.Element {
  return (
    <section className="border-t border-border pt-6 space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg text-foreground">Summary</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-1.5">
          <Label htmlFor="commission" className="text-sm text-foreground">
            Commission (%)
          </Label>
          <Input
            id="commission"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={commissionPercentage || ""}
            onChange={(e) =>
              setCommissionPercentage(parseFloat(e.target.value) || 0)
            }
            onKeyDown={(e) => {
              // Prevent Enter key from doing anything
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur(); // Close keyboard on mobile
              }
            }}
            className="h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            max={100}
            autoComplete="off"
            tabIndex={-1}
            inputMode="decimal"
          />
        </div>
        <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-border">
          <div className="text-sm font-medium text-muted-foreground">
            Calculations
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground">Total Amount:</span>
              <div className="text-right">
                <span className="font-medium text-foreground">
                  ₹
                  {totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">
                Commission ({commissionPercentage}%):
              </span>
              <div className="text-right">
                <span className="font-medium text-foreground">
                  - ₹
                  {adjustedCommission.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-2">
              <span className="text-foreground">Net Amount:</span>
              <div className="text-right">
                <span className="text-primary">
                  ₹{roundedNetAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
