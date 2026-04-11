"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logger } from "@/lib/logger";
import { db } from "@mfc/database";
import { X } from "lucide-react";
import { KeyboardEvent, useEffect, useState } from "react";

export function MfcStaffAutocomplete({
  value,
  onChange,
  onEnterKey,
  placeholder,
  inputRef,
}: {
  value: string;
  onChange: (name: string, staffId: string | null) => void;
  onEnterKey?: () => void;
  placeholder: string;
  inputRef?: (el: HTMLInputElement | null) => void;
}): React.JSX.Element {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 1) {
        setSuggestions([]);
        setSelectedIndex(-1);
        return;
      }

      try {
        const searchTerm = value.toLowerCase();
        const staff = await db.mfc_staff
          .filter(
            (s) =>
              s.role === "mfc_seller" &&
              s.is_active === true &&
              s.full_name?.toLowerCase().includes(searchTerm)
          )
          .limit(10)
          .toArray();

        setSuggestions(staff);
        if (staff.length > 0) {
          setSelectedIndex(0);
        }
      } catch (error) {
        logger.error(error, "❌ Error fetching staff suggestions");
      }
    };

    const debounce = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(debounce);
  }, [value]);

  const selectStaff = (staff: any) => {
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
        selectStaff(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        selectStaff(suggestions[0]);
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

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setShowSuggestions(true);

    if (window.innerWidth < 768) {
      const input = e.currentTarget;
      setTimeout(() => {
        if (!input) return;
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

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value, null);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        }}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-9 text-sm"
        autoComplete="off"
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
              className={`px-3 py-2 cursor-pointer text-sm ${
                index === selectedIndex ? "bg-accent" : "hover:bg-accent"
              }`}
            >
              <div className="font-medium">{staff.full_name}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {staff.role.replace("_", " ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
