"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { logger } from "@/lib/logger";
import { createClient } from "@mfc/supabase-config";
import { Loader2, Plus, Save } from "lucide-react";
import { useEffect, useReducer, useRef } from "react";
import { FloorSaleItemRow } from "./mfc-sale/FloorSaleItemRow";
import type { FloorSaleItem } from "./mfc-sale/types";

interface FloorSaleState {
  saleDate: string;
  saleItems: FloorSaleItem[];
  saving: boolean;
}

type Action =
  | { type: "ADD_SALE_ITEM"; prefillProduct?: string }
  | { type: "ADD_SALE_ITEM_AFTER"; afterId: string }
  | { type: "REMOVE_SALE_ITEM"; id: string }
  | {
    type: "UPDATE_SALE_ITEM";
    id: string;
    field: keyof FloorSaleItem;
    value: string | number | null;
  }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "RESET_FORM" };

const initialState: FloorSaleState = {
  saleDate: new Date().toISOString().split("T")[0] ?? "",
  saleItems: [],
  saving: false,
};

function reducer(state: FloorSaleState, action: Action): FloorSaleState {
  switch (action.type) {
    case "ADD_SALE_ITEM":
      const newItem: FloorSaleItem = {
        id: crypto.randomUUID(),
        mfcSellerName: "",
        mfcSellerId: null,
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
      const newItemAfter: FloorSaleItem = {
        id: crypto.randomUUID(),
        mfcSellerName: "",
        mfcSellerId: null,
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
        saleDate: new Date().toISOString().split("T")[0] ?? "",
      };
    default:
      return state;
  }
}

export function FloorSaleEntry(): React.ReactElement {
  const { showToast } = useToast();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { saleDate, saleItems, saving } = state;

  const sellerRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const buyerRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const productRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const weightRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const rateRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (saleItems.length > 0) {
      const lastItem = saleItems[saleItems.length - 1];
      if (lastItem) {
        const sellerInput = sellerRefs.current[lastItem.id];
        if (sellerInput) {
          setTimeout(() => sellerInput.focus(), 50);
        }
      }
    }
  }, [saleItems.length]);

  const totalAmount = saleItems.reduce((sum, item) => sum + item.total, 0);

  const updateItem = (
    id: string,
    field: keyof FloorSaleItem,
    value: string | number | null
  ) => {
    dispatch({ type: "UPDATE_SALE_ITEM", id, field, value });
  };

  const assignRef = (
    type: "seller" | "buyer" | "product" | "weight" | "rate",
    id: string,
    el: HTMLInputElement | null
  ) => {
    const refMap = {
      seller: sellerRefs,
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

  const handleSellerEnter = (itemId: string) =>
    buyerRefs.current[itemId]?.focus();
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
    if (saleItems.length === 0) {
      showToast("error", "Please add at least one sale item");
      return;
    }

    const invalidItems = saleItems.filter(
      (item) =>
        !item.mfcSellerId ||
        !item.buyerId ||
        !item.stockBatchId ||
        item.weight <= 0 ||
        item.rate <= 0
    );

    if (invalidItems.length > 0) {
      showToast("error", "Please fill in all required fields (seller, buyer, product/batch, weight, rate)");
      return;
    }

    dispatch({ type: "SET_SAVING", saving: true });

    try {
      const supabase = createClient();
      const formattedItems = saleItems.map((item) => ({
        mfc_seller_id: item.mfcSellerId,
        buyer_id: item.buyerId,
        product_id: item.productId,
        stock_batch_id: item.stockBatchId,
        weight: item.weight,
        rate: item.rate,
      }));

      const { data, error } = await supabase.rpc("create_floor_sale", {
        p_sale_items: formattedItems,
        p_sale_date: saleDate,
      });

      if (error) {
        logger.error(error, "❌ RPC Error");
        throw new Error(error.message);
      }

      logger.info({ data }, "✅ RPC Success");

      // submit_floor_sale returns jsonb with created_bills and created_chalans arrays
      const billCount = data?.created_bills?.length || 0;
      const chalanCount = data?.created_chalans?.length || 0;
      showToast("success", `✅ Floor Sale Created • ${billCount} Bills, ${chalanCount} Chalans • Total: ₹${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`);
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
          Quick Floor Sale Entry
        </h1>
        <div className="text-sm text-muted-foreground">
          Date: {new Date(saleDate).toLocaleDateString("en-IN")}
        </div>
      </div>

      <div className="border border-border rounded-lg py-4 md:p-6 bg-card shadow-sm space-y-6">
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
                <FloorSaleItemRow
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
                  handleSellerEnter={handleSellerEnter}
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
