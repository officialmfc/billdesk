"use client";

import { getKolkataDateString } from "@/lib/kolkata-date";
import { format, isValid, parse } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

const DATE_PARAM = "date";
const DATE_FORMAT = "yyyy-MM-dd";

function parseSelectedDate(value: string | null): Date {
  if (!value) {
    return parse(getKolkataDateString(), DATE_FORMAT, new Date());
  }

  const parsed = parse(value, DATE_FORMAT, new Date());
  return isValid(parsed) ? parsed : new Date();
}

export function formatOperationsDate(date: Date): string {
  return format(date, DATE_FORMAT);
}

export function useOperationsDate() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedDate = useMemo(
    () => parseSelectedDate(searchParams.get(DATE_PARAM)),
    [searchParams]
  );

  const dateStr = useMemo(
    () => formatOperationsDate(selectedDate),
    [selectedDate]
  );

  const buildHref = useCallback(
    (href: string, nextDate: Date | string = dateStr) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(
        DATE_PARAM,
        typeof nextDate === "string" ? nextDate : formatOperationsDate(nextDate)
      );

      const query = params.toString();
      return query ? `${href}?${query}` : href;
    },
    [dateStr, searchParams]
  );

  const setSelectedDate = useCallback(
    (nextDate: Date) => {
      router.replace(buildHref(pathname, nextDate), { scroll: false });
    },
    [buildHref, pathname, router]
  );

  const goToPreviousDay = useCallback(() => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() - 1);
    setSelectedDate(nextDate);
  }, [selectedDate, setSelectedDate]);

  const goToNextDay = useCallback(() => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate);
  }, [selectedDate, setSelectedDate]);

  const goToToday = useCallback(() => {
    setSelectedDate(parse(getKolkataDateString(), DATE_FORMAT, new Date()));
  }, [setSelectedDate]);

  return {
    buildHref,
    dateStr,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    selectedDate,
    setSelectedDate,
  };
}
