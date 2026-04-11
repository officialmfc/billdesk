"use client";

const kolkataFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getKolkataDateString(date: Date = new Date()): string {
  return kolkataFormatter.format(date);
}

export function isKolkataToday(dateStr: string): boolean {
  return dateStr === getKolkataDateString();
}
