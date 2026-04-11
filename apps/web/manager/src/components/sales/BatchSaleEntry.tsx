"use client";

import { useReducer, useRef, useEffect } from "react";
import { createClient } from "@mfc/supabase-config";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Plus, Save, Loader2 } from "lucide-react";
import { MfcStaffAutocomplete } from "./shared/MfcStaffAutocomplete";
import { BatchSaleItemRow } from "./mfc-sale/BatchSaleItemRow";
import type { BatchSaleItem } from "./mfc-sale/types";
import { getCurrentDateIST } from "@/lib/date-utils";

interface BatchSaleState {
  saleDate: string;
  mfcSellerName: string;
  mfcSellerId: string | null;
  saleItems: BatchSaleItem[];
  saving: boolean;
}

type Action =
  | { type: "SET_SELLER"; name: string; id: string | null }
  | { type: "ADD_SALE_ITEM"; prefillProduct?: string }
  | { type: "ADD_SALE_ITEM_AFTER"; afterId: string }
  | { type: "REMOVE_SALE_ITEM"; id: string }
  | {
    type: "UPDATE_SALE_ITEM";
    id: string;
    field: keyof BatchSaleItem;
    value: string | number | null;
  }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "RESET_FORM" };

const initialState: BatchSaleState = {
  saleDate: getCurrentDateIST(),
  mfcSellerName: "",
  mfcSellerId: null,
  saleItems: [],
  saving: false,
};

function reducer(state: BatchSaleState, action: Action): BatchSaleState {
  switch (action.type) {
    case "SET_SELLER":
      return { ...state, mfcSellerName: action.name, mfcSellerId: action.id };
    case "ADD_SALE_ITEM":
      const newItem: BatchSaleItem = {
        id: crypto.randomUUID(),
        buyerName: "",
        buyerId: null,
        productName: action.prefillProduct || "",
        productId: null,
        stockBatchId: null,
        weight: 0,
        rate: 0,
        total: 0,
      };
      return { ...state, saleItems: [...state.saleItems, newItem] };
    case "ADD_SALE_ITEM_AFTER": {
      const newItems = [...state.saleItems];
      const currentIndex = newItems.findIndex(
        (item) => item.id === action.afterId
      );
      const currentItem =
        currentIndex !== -1 ? newItems[currentIndex] : undefined;
      const newItemAfter: BatchSaleItem = {
        id: crypto.randomUUID(),
        buyerName: "",
        buyerId: null,
        productName: currentItem?.productName || "",
        productId: null,
        stockBatchId: null,
        weight: 0,
        rate: 0,
        total: 0,
      };
      if (currentIndex !== -1) {
        newItems.splice(currentIndex + 1, 0, newItemAfter);
      } else {
        newItems.push(newItemAfter);
      }
      return { ...state, saleItems: newItems };
    }
    case "REMOVE_SALE_ITEM":
      return {
        ...state,
        saleItems: state.saleItems.filter((item) => item.id !== action.id),
      };
    case "UPDATE_SALE_ITEM":
      return {
        ...state,
        saleItems: state.saleItems.map((item) => {
          if (item.id !== action.id) return item;
          const updated = { ...item, [action.field]: action.value };
          if (action.field === "weight" || action.field === "rate") {
            updated.total = updated.weight * updated.rate;
          }
          return updated;
        }),
      };
    case "SET_SAVING":
      return { ...state, saving: action.saving };
    case "RESET_FORM":
      return {
        ...initialState,
        saleDate: getCurrentDateIST(),
      };
    default:
      return state;
  }
}

export function BatchSaleEntry(): React.ReactElement {
  const { showToast } = useToast();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { saleDate, mfcSellerName, mfcSellerId, saleItems, saving } = state;

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

  const updateItem = (
    id: string,
    field: keyof BatchSaleItem,
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
      dispatch({
        type: "ADD_SALE_ITEM",
        prefillProduct: currentItem.productName,
      });
    }
  };

  const handleSubmit = async () => {
    if (!mfcSellerId) {
      showToast("error", "Please select an MFC seller");
      return;
    }

    if (saleItems.length === 0) {
      showToast("error", "Please add at least one sale item");
      return;
    }

    const invalidItems = saleItems.filter(
      (item) =>
        !item.buyerId ||
        !item.stockBatchId ||
        item.weight <= 0 ||
        item.rate <= 0
    );

    if (invalidItems.length > 0) {
      showToast("error", "Please fill in all required fields (buyer, product/batch, weight, rate)");
      return;
    }

    dispatch({ type: "SET_SAVING", saving: true });

    try {
      const supabase = createClient();
      const formattedItems = saleItems.map((item) => ({
        buyer_id: item.buyerId,
        product_id: item.productId,
        stock_batch_id: item.stockBatchId,
        weight: item.weight,
        rate: item.rate,
      }));

      const { data: chalanId, error } = await supabase.rpc("create_seller_batch_sale", {
        p_mfc_seller_id: mfcSellerId,
        p_sale_items: formattedItems,
        p_sale_date: saleDate,
      });

      if (error) {
        console.error("❌ RPC Error:", error);
        throw new Error(error.message);
      }

      console.log("✅ RPC Success - Chalan ID:", chalanId);

      // Fetch the chalan details to get chalan_number and total_amount
      const { data: chalanData, error: chalanError } = await supabase
        .from("chalans")
        .select("chalan_number, total_amount")
        .eq("id", chalanId)
        .single();

      if (chalanError) {
        console.error("❌ Error fetching chalan details:", chalanError);
        // Still show success but with generic message
        showToast("success", `✅ Batch sale completed successfully • Total: ₹${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`);
      } else {
        const chalanNumber = chalanData?.chalan_number || 'N/A';
        const totalFromDb = chalanData?.total_amount ? Number(chalanData.total_amount) : totalAmount;
        showToast("success", `✅ Chalan ${chalanNumber} • Total: ₹${totalFromDb.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`);
      }

      dispatch({ type: "RESET_FORM" });
    } catch (error) {
      const errorMessage = (error as Error).message || "";

      // User-friendly error messages
      if (errorMessage.includes("insufficient stock") || errorMessage.includes("stock")) {
        showToast("error", "❌ Insufficient Stock - One or more items don't have enough stock available");
      } else if (errorMessage.includes("not found") || errorMessage.includes("does not exist")) {
        showToast("error", "❌ Invalid Data - Selected seller, buyer, or product not found");
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
          Seller Batch Sale Entry
        </h1>
        <div className="text-sm text-muted-foreground">
          Date: {new Date(saleDate).toLocaleDateString("en-IN")}
        </div>
      </div>

      <div className="border border-border rounded-lg py-4 md:p-6 bg-card shadow-sm space-y-6">
        <section className="space-y-3">
          <div className="space-y-1.5 p-2">
            <Label htmlFor="seller-name" className="text-sm font-medium pl-3">
              MFC Seller *
            </Label>
            <MfcStaffAutocomplete
              value={mfcSellerName}
              onChange={(name, id) =>
                dispatch({ type: "SET_SELLER", name, id })
              }
              placeholder="Search and select MFC seller..."
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
                <BatchSaleItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  mfcSellerId={mfcSellerId}
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

        <div className="border-t border-border pt-4">
          <div className="text-right text-lg font-semibold text-foreground">
            Total Amount: ₹
            {totalAmount.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
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
              Save Sale
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
      </div>
    </div>
  );
}
