"use client";

import { useReducer, useRef, useEffect } from "react";
import { createClient } from "@mfc/supabase-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Plus, Save, Loader2 } from "lucide-react";
import { UserAutocomplete } from "./auction-sale/UserAutocomplete";
import { SaleItemRow } from "./auction-sale/SaleItemRow";
import { SaleSummary } from "./auction-sale/SaleSummary";
import { saleReducer, initialState, SaleItem } from "./auction-sale/state";

export function AuctionSaleEntry(): React.ReactElement {
  const { showToast } = useToast();
  const [state, dispatch] = useReducer(saleReducer, initialState);
  const {
    chalanDate,
    sellerName,
    sellerId,
    commissionPercentage,
    paidAmount,
    saleItems,
    saving,
  } = state;

  const buyerRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const productRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const weightRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const rateRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (saleItems.length > 0) {
      const lastItem = saleItems[saleItems.length - 1];
      if (lastItem) {
        const buyerInput = buyerRefs.current[lastItem.id];
        if (buyerInput) {
          setTimeout(() => buyerInput.focus(), 50);
        }
      }
    }
  }, [saleItems.length]);

  const totalAmount = saleItems.reduce((sum, item) => sum + item.total, 0);
  const commissionAmount = (totalAmount * commissionPercentage) / 100;
  const netAmount = totalAmount - commissionAmount;
  const roundedNetAmount = Math.floor(netAmount / 5) * 5;
  const adjustedCommission = totalAmount - roundedNetAmount;

  const updateItem = (
    id: string,
    field: keyof SaleItem,
    value: string | number | null
  ) => {
    dispatch({ type: "UPDATE_SALE_ITEM", id, field, value });
  };

  const assignRef = (
    type: "buyer" | "product" | "weight" | "rate",
    id: string,
    el: HTMLInputElement | null
  ) => {
    const refMap = {
      buyer: buyerRefs,
      product: productRefs,
      weight: weightRefs,
      rate: rateRefs,
    };
    if (el) {
      refMap[type].current[id] = el;
    } else {
      delete refMap[type].current[id];
    }
  };

  const handleBuyerEnter = (itemId: string) =>
    productRefs.current[itemId]?.focus();
  const handleProductEnter = (itemId: string) =>
    weightRefs.current[itemId]?.focus();
  const handleWeightEnter = (itemId: string) =>
    rateRefs.current[itemId]?.focus();
  const handleRateEnter = (itemId: string) => {
    const currentItem = saleItems.find((item) => item.id === itemId);
    if (currentItem && currentItem.weight > 0 && currentItem.rate > 0) {
      // Only add new item if current item has valid weight and rate
      dispatch({
        type: "ADD_SALE_ITEM",
        prefillProduct: currentItem.productDescription,
      });
    }
  };

  const handleSubmit = async () => {
    if (!sellerId) {
      showToast("error", "Please select a seller");
      return;
    }

    if (saleItems.length === 0) {
      showToast("error", "Please add at least one sale item");
      return;
    }

    const invalidItems = saleItems.filter(
      (item) => !item.buyerId || item.weight <= 0 || item.rate <= 0
    );

    if (invalidItems.length > 0) {
      showToast("error", "Please fill in all required fields (buyer, weight, rate)");
      return;
    }

    dispatch({ type: "SET_SAVING", saving: true });

    try {
      const supabase = createClient();
      const formattedItems = saleItems.map((item) => ({
        buyer_id: item.buyerId,
        product_description: item.productDescription || null,
        weight: item.weight,
        rate: item.rate,
      }));

      const { data: chalanId, error } = await supabase.rpc("create_auction_sale", {
        p_seller_id: sellerId,
        p_sale_items: formattedItems,
        p_commission_percentage: commissionPercentage,
        p_paid_amount: paidAmount > 0 ? paidAmount : null,
        p_chalan_date: chalanDate,
      });

      if (error) {
        console.error("❌ RPC Error:", error);
        throw new Error(error.message);
      }

      console.log("✅ RPC Success - Chalan ID:", chalanId);

      showToast("success", `✅ Auction Sale Created • Amount Payable: ₹${roundedNetAmount.toLocaleString("en-IN")}`);
      dispatch({ type: "RESET_FORM" });
    } catch (error) {
      const errorMessage = (error as Error).message || "";

      // User-friendly error messages
      if (errorMessage.includes("insufficient stock") || errorMessage.includes("stock")) {
        showToast("error", "❌ Insufficient Stock - One or more items don't have enough stock available");
      } else if (errorMessage.includes("not found") || errorMessage.includes("does not exist")) {
        showToast("error", "❌ Invalid Data - Selected seller or product not found");
      } else if (errorMessage.includes("permission") || errorMessage.includes("authorized")) {
        showToast("error", "❌ Permission Denied - Contact your administrator");
      } else if (errorMessage.includes("duplicate") || errorMessage.includes("already exists")) {
        showToast("error", "❌ Duplicate Entry - This sale may have already been recorded");
      } else {
        showToast("error", `❌ Error: ${errorMessage || "An unexpected error occurred"}`);
      }
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Auction Sale Entry
        </h1>
        <div className="text-sm text-muted-foreground">
          Date: {new Date(chalanDate).toLocaleDateString("en-IN")}
        </div>
      </div>

      <div className="border border-border rounded-lg py-4 md:p-6 bg-card shadow-sm space-y-6">
        <section className="space-y-3">
          <div className="space-y-1.5 p-2">
            <Label htmlFor="seller-name" className="text-sm font-medium pl-3">
              Seller Name *
            </Label>
            <UserAutocomplete
              value={sellerName}
              onChange={(name, id) =>
                dispatch({ type: "SET_SELLER", name, id })
              }
              placeholder="Search and select seller..."
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-5">
            <h3 className="font-semibold text-lg text-foreground">
              Sale Items ({saleItems.length})
            </h3>
            {saleItems.length > 0 && (
              <Button
                onClick={() => dispatch({ type: "ADD_SALE_ITEM" })}
                size="sm"
                variant="outline"
                className="h-9"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            )}
          </div>

          {saleItems.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center bg-muted/20">
              <p className="text-muted-foreground text-sm mb-4">
                No items have been added to this sale yet.
              </p>
              <Button
                onClick={() => dispatch({ type: "ADD_SALE_ITEM" })}
                size="sm"
                className="h-9"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {saleItems.map((item, index) => (
                <SaleItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  updateItem={updateItem}
                  removeItem={(id) =>
                    dispatch({ type: "REMOVE_SALE_ITEM", id })
                  }
                  addItem={(afterId) =>
                    dispatch({ type: "ADD_SALE_ITEM_AFTER", afterId })
                  }
                  handleBuyerEnter={handleBuyerEnter}
                  handleProductEnter={handleProductEnter}
                  handleWeightEnter={handleWeightEnter}
                  handleRateEnter={handleRateEnter}
                  assignRef={assignRef}
                  isFirstItem={index === 0}
                />
              ))}
            </div>
          )}
        </section>

        <SaleSummary
          totalAmount={totalAmount}
          commissionPercentage={commissionPercentage}
          adjustedCommission={adjustedCommission}
          roundedNetAmount={roundedNetAmount}
          setCommissionPercentage={(p) =>
            dispatch({ type: "SET_COMMISSION_PERCENTAGE", percentage: p })
          }
        />

        <div className="space-y-3 border-t border-border pt-4">
          <h4 className="font-semibold text-base text-foreground">
            Payment Details
          </h4>
          <div className="space-y-1.5">
            <Label htmlFor="paid-amount" className="text-sm">
              Paid Amount (₹)
            </Label>
            <Input
              id="paid-amount"
              type="number"
              step="0.01"
              value={paidAmount || ""}
              onChange={(e) =>
                dispatch({
                  type: "SET_PAID_AMOUNT",
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              onKeyDown={(e) => {
                // Prevent Enter key from doing anything
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur(); // Close keyboard on mobile
                }
              }}
              placeholder="0.00"
              className="h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              tabIndex={-1}
              inputMode="decimal"
            />
            <p className="text-xs text-muted-foreground">
              Leave 0 for no payment, or enter partial/full amount
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={saving || saleItems.length === 0}
          className="w-full h-11 text-base"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Chalan
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => dispatch({ type: "RESET_FORM" })}
          className="w-full h-11 text-base"
        >
          Cancel
        </Button>

        {/* Preview Table */}
        {saleItems.length > 0 && (
          <div className="mt-6 py-2 bg-muted/30 rounded-lg border border-border">
            <h4 className="text-sm font-semibold mb-2 text-foreground text-center">
              Items Preview
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="text-xs font-semibold text-muted-foreground bg-muted/50">
                  <tr className="[&_th]:px-2 [&_th]:py-1 [&_th]:border-b [&_th]:border-t [&_th]:border-border">
                    <th className="sticky left-0 bg-muted/50 text-center w-10 border-r">
                      #
                    </th>
                    <th className="text-left min-w-[120px]">Product</th>
                    <th className="text-left min-w-[150px]">Buyer</th>
                    <th className="text-right w-24">Weight</th>
                    <th className="text-right w-24">Rate</th>
                    <th className="text-right w-28">Total</th>
                  </tr>
                </thead>
                <tbody className="[&_td]:px-2 [&_td]:py-1 [&_td]:border-b [&_td]:border-border">
                  {saleItems.map((item, index) => {
                    let businessNameOnly = item.buyerName || "";
                    if (businessNameOnly.includes("(")) {
                      businessNameOnly =
                        businessNameOnly.split("(")[0]?.trim() ||
                        businessNameOnly;
                    }

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-muted/20 transition-colors last:[&_td]:border-b-0"
                      >
                        <td className="sticky left-0 bg-card text-center font-semibold text-primary border-r">
                          {index + 1}
                        </td>
                        <td className="text-muted-foreground">
                          {item.productDescription || "N/A"}
                        </td>
                        <td className="font-medium text-foreground">
                          {businessNameOnly}
                        </td>
                        <td className="text-right font-mono text-foreground">
                          {item.weight.toFixed(2)}
                        </td>
                        <td className="text-right font-mono text-foreground">
                          {item.rate.toFixed(2)}
                        </td>
                        <td className="text-right font-semibold text-primary">
                          ₹{item.total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
