"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { searchManagerMfcSellers } from "@/lib/manager-directory-search";
import { Button } from "@/components/ui/button";
import type { LocalMfcStaff } from "@mfc/database";
import { X } from "lucide-react";

export function MfcStaffAutocomplete({
  value,
  onChange,
  onEnterKey,
  onFocus,
  placeholder,
  autoFocus = false,
  inputRef,
}: {
  value: string;
  onChange: (name: string, staffId: string | null) => void;
  onEnterKey?: () => void;
  onFocus?: () => void;
  placeholder: string;
  autoFocus?: boolean;
  inputRef?: React.RefObject<HTMLInputElement> | ((el: HTMLInputElement | null) => void);
}): React.JSX.Element {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<LocalMfcStaff[]>([]);

  useEffect(() => {
    let cancelled = false;

    const debounce = setTimeout(async () => {
      if (value.length < 1) {
        setSuggestions([]);
        setSelectedIndex(-1);
        return;
      }

      try {
        const staff = await searchManagerMfcSellers(value);

        if (!cancelled) {
          setSuggestions(staff);
          setSelectedIndex(staff.length > 0 ? 0 : -1);
        }
      } catch (error) {
        console.error("Error fetching MFC sellers:", error);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [value]);

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

  const selectStaff = (staff: LocalMfcStaff) => {
    onChange(staff.full_name, staff.id);
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
        const selectedStaff = suggestions[selectedIndex];
        if (selectedStaff) {
          selectStaff(selectedStaff);
        }
      } else if (suggestions.length > 0) {
        const firstSuggestion = suggestions[0];
        if (firstSuggestion) {
          selectStaff(firstSuggestion);
        }
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
          onChange(e.target.value, null);
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
          onClick={() => onChange("", null)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((staff, index) => (
            <div
              key={staff.id}
              onMouseDown={(e) => {
                e.preventDefault();
                selectStaff(staff);
              }}
              className={`px-3 py-2 cursor-pointer text-sm ${index === selectedIndex ? "bg-accent" : "hover:bg-accent"
                }`}
            >
              <div className="font-medium">{staff.full_name}</div>
              <div className="text-xs text-muted-foreground">{staff.role}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
