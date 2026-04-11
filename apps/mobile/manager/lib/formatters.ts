const INDIA_TIMEZONE = "Asia/Kolkata";

function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatWithParts(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIMEZONE,
    ...options,
  }).format(date);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function getTodayDateString(): string {
  return toDateString(new Date());
}

export function toDateString(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

export function shiftDateString(dateString: string, amount: number): string {
  const date = parseDateString(dateString);
  date.setUTCDate(date.getUTCDate() + amount);
  return toDateString(date);
}

export function formatShortDate(dateString: string): string {
  return formatWithParts(parseDateString(dateString), {
    day: "2-digit",
    month: "short",
  });
}

export function formatLongDate(dateString: string): string {
  return formatWithParts(parseDateString(dateString), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatReadableDate(dateString: string): string {
  return formatWithParts(parseDateString(dateString), {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function matchesSearch(text: string | null | undefined, query: string): boolean {
  if (!query.trim()) {
    return true;
  }

  return (text ?? "").toLowerCase().includes(query.trim().toLowerCase());
}
