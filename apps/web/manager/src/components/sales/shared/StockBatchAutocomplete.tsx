"use client";

import { useState, useEffect, KeyboardEvent, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@mfc/data-access";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function StockBatchAutocomplete({
  value,
  onChange,
  onEnterKey,
  onFocus,
  placeholder,
  autoFocus = false,
  inputRef,
  mfcSellerId,
}: {
  value: string;
  onChange: (
    productName: string,
    productId: string | null,
    stockBatchId: string | null
  ) => void;
  onEnterKey?: () => void;
  onFocus?: () => void;
  placeholder: string;
  autoFocus?: boolean;
  inputRef?: React.RefObject<HTMLInputElement> | ((el: HTMLInputElement | null) => void);
  mfcSellerId?: string | null;
}): React.JSX.Element {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");

  // Build filters for stock batches
  const filters = useMemo(() => {
    if (searchTerm.length < 1) return undefined;

    const baseFilters: any = {
      current_weight_kg: { $gt: 0 }
    };

    if (mfcSellerId) {
      baseFilters.mfc_seller_id = mfcSellerId;
    }

    return baseFilters;
  }, [searchTerm, mfcSellerId]);

  // Use useQuery to fetch stock batches
  const { data: allBatches = [] } = useQuery('stock_batches', {
    filters,
    limit: 50, // Get more results for client-side filtering
    enabled: searchTerm.length >= 1,
  });

  // Filter batches by search term on client side (for product_name and batch_code)
  const suggestions = useMemo(() => {
    if (searchTerm.length < 1) return [];

    const term = searchTerm.toLowerCase();
    return allBatches
      .filter((b: any) =>
        b.product_name?.toLowerCase().includes(term) ||
        b.batch_code?.toLowerCase().includes(term)
      )
      .slice(0, 10);
  }, [allBatches, searchTerm]);

  // Update search term with debounce
  useEffect(() => {
    const debounce = setTimeout(() => {
      setSearchTerm(value);
      if (value.length < 1) {
        setSelectedIndex(-1);
      } else if (suggestions.length > 0) {
        setSelectedIndex(0);
      }
    }, 150);
    return () => clearTimeout(debounce);
  }, [value, suggestions.length]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setShowSuggestions(true);

    if (onFocus) {
      onFocus();
    }

    // Scroll input to top on mobile
    if (window.innerWidth < 768) {
      const input = e.currentTarget;
      setTimeout(() => {
        const mainContainer = input.closest("main");
        if (mainContainer) {
          const inputRect = input.getBoundingClientRect();
          const containerRect = mainContainer.getBoundingClientRect();
          const inputOffsetInContainer = inputRect.top - containerRect.top;
          const targetScroll =
            mainContainer.scrollTop + inputOffsetInContainer - 15;
          mainContainer.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: "smooth",
          });
        }
      }, 350);
    }
  };

  const selectBatch = (batch: any) => {
    onChange(batch.product_name || "", batch.product_id, batch.id);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (onEnterKey) {
      setTimeout(() => onEnterKey(), 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (
        suggestions.length > 0 &&
        selectedIndex >= 0 &&
        suggestions[selectedIndex]
      ) {
        selectBatch(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        selectBatch(suggestions[0]);
      } else if (onEnterKey) {
        onEnterKey();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setShowSuggestions(true);
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setShowSuggestions(true);
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value, null, null);
          setShowSuggestions(true);
          // Don't reset selectedIndex - let useEffect handle it when suggestions load
        }}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-9 text-sm"
        autoComplete="off"
        autoFocus={autoFocus}
        enterKeyHint="next"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={() => onChange("", null, null)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((batch, index) => (
            <div
              key={batch.id}
              onMouseDown={(e) => {
                e.preventDefault();
                selectBatch(batch);
              }}
              className={`px-3 py-2 cursor-pointer text-sm ${index === selectedIndex ? "bg-accent" : "hover:bg-accent"
                }`}
            >
              <div className="font-medium">{batch.product_name}</div>
              <div className="text-xs text-muted-foreground">
                Batch: {batch.batch_code} • Available: {batch.current_weight_kg}
                kg
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
