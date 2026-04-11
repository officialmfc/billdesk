"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchManagerUsers } from "@/lib/manager-directory-search";
import type { LocalUser } from "@mfc/database";
import { X } from "lucide-react";
import { useEffect, useState, type KeyboardEvent } from "react";

type AutocompleteUser = {
  id: string;
  name: string;
  business_name: string | null;
  phone?: string | null;
  is_active: boolean;
};

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function scoreMatch(term: string, user: AutocompleteUser): number {
  const values = [user.business_name, user.name, user.phone]
    .map(normalize)
    .filter(Boolean);

  if (values.some((value) => value === term)) {
    return 5;
  }

  if (values.some((value) => value.startsWith(term))) {
    return 4;
  }

  if (values.some((value) => value.includes(term))) {
    return 3;
  }

  return 0;
}

function filterStaticSuggestions(users: AutocompleteUser[], termInput: string): AutocompleteUser[] {
  const term = normalize(termInput);

  if (!term) {
    return [];
  }

  return [...users]
    .filter((user) => user.is_active && scoreMatch(term, user) > 0)
    .sort((left, right) => {
      const rightScore = scoreMatch(term, right);
      const leftScore = scoreMatch(term, left);

      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      return (left.business_name || left.name).localeCompare(
        right.business_name || right.name
      );
    })
    .slice(0, 10);
}

type UserAutocompleteProps = {
  value: string;
  onChange: (name: string, userId: string | null) => void;
  onEnterKey?: () => void;
  onFocus?: () => void;
  placeholder: string;
  autoFocus?: boolean;
  userType?: string;
  inputRef?: React.RefObject<HTMLInputElement> | ((el: HTMLInputElement | null) => void);
  staticSuggestions?: AutocompleteUser[];
  emptyState?: React.ReactNode;
};

export function UserAutocomplete({
  value,
  onChange,
  onEnterKey,
  onFocus,
  placeholder,
  autoFocus = false,
  userType,
  inputRef,
  staticSuggestions,
  emptyState,
}: UserAutocompleteProps): React.JSX.Element {
  const [suggestions, setSuggestions] = useState<AutocompleteUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setShowSuggestions(true);

    if (onFocus) {
      onFocus();
    }

    if (window.innerWidth < 768) {
      const input = event.currentTarget;

      setTimeout(() => {
        const mainContainer = input.closest("main");

        if (!mainContainer) {
          return;
        }

        const inputRect = input.getBoundingClientRect();
        const containerRect = mainContainer.getBoundingClientRect();
        const inputOffsetInContainer = inputRect.top - containerRect.top;
        const targetScroll = mainContainer.scrollTop + inputOffsetInContainer - 15;

        mainContainer.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: "smooth",
        });
      }, 350);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchSuggestions = async () => {
      if (value.length < 1) {
        setSuggestions([]);
        setSelectedIndex(-1);
        return;
      }

      if (staticSuggestions) {
        const users = filterStaticSuggestions(staticSuggestions, value);

        if (!cancelled) {
          setSuggestions(users);
          setSelectedIndex(users.length > 0 ? 0 : -1);
        }
        return;
      }

      try {
        const users = await searchManagerUsers(value, userType);

        if (!cancelled) {
          setSuggestions(users);
          setSelectedIndex(users.length > 0 ? 0 : -1);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 150);

    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [staticSuggestions, userType, value]);

  const selectUser = (user: AutocompleteUser) => {
    onChange(user.business_name || user.name, user.id);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    if (onEnterKey) {
      setTimeout(() => onEnterKey(), 0);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (suggestions.length > 0 && selectedIndex >= 0 && suggestions[selectedIndex]) {
        const selectedUser = suggestions[selectedIndex];
        if (selectedUser) {
          selectUser(selectedUser);
        }
      } else if (suggestions.length > 0) {
        const firstSuggestion = suggestions[0];
        if (firstSuggestion) {
          selectUser(firstSuggestion);
        }
      } else if (onEnterKey) {
        onEnterKey();
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setShowSuggestions(true);
      setSelectedIndex((previous) =>
        previous < suggestions.length - 1 ? previous + 1 : previous
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setShowSuggestions(true);
      setSelectedIndex((previous) => (previous > 0 ? previous - 1 : -1));
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(event) => {
          onChange(event.target.value, null);
          setShowSuggestions(true);
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

      {value ? (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => onChange("", null)}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}

      {showSuggestions && value.trim().length > 0 ? (
        suggestions.length > 0 ? (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
            {suggestions.map((user, index) => {
              const displayName = user.business_name
                ? `${user.business_name} (${user.name})`
                : user.name;

              return (
                <div
                  key={user.id}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectUser(user);
                  }}
                  className={`cursor-pointer px-3 py-2 text-sm ${
                    index === selectedIndex ? "bg-accent" : "hover:bg-accent"
                  }`}
                >
                  <div className="font-medium">{displayName}</div>
                  {user.phone ? (
                    <div className="text-xs text-muted-foreground">{user.phone}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : emptyState ? (
          <div
            className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg"
            onMouseDown={(event) => {
              event.preventDefault();
            }}
          >
            {emptyState}
          </div>
        ) : null
      ) : null}
    </div>
  );
}
