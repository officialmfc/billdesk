"use client";

import { format } from "date-fns";

import { cn } from "@/lib/utils";

export interface CalendarProps {
  mode?: "single";
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  className?: string;
  initialFocus?: boolean;
  inline?: boolean;
  disabled?: (date: Date) => boolean;
}

function toInputValue(date: Date | undefined): string {
  return date ? format(date, "yyyy-MM-dd") : "";
}

function fromInputValue(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00`);
}

function Calendar({
  selected,
  onSelect,
  className,
  initialFocus = false,
  inline = false,
  disabled,
}: CalendarProps) {
  return (
    <input
      type="date"
      value={toInputValue(selected)}
      autoFocus={initialFocus}
      onChange={(event) => {
        const nextDate = fromInputValue(event.target.value);
        if (nextDate && disabled?.(nextDate)) {
          return;
        }
        onSelect(nextDate);
      }}
      className={cn(
        "border-input bg-transparent text-foreground file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        inline && "mx-auto w-[180px]",
        className
      )}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
