"use client";

import { FileCheck, FileText, Home, PlusCircle } from "lucide-react";

import {
  DailyOperationsLinkCard,
  DailyOperationsShell,
} from "@/components/operations/daily-operations-shared";
import { useOperationsDate } from "@/components/operations/useOperationsDate";

export function DailyOperationsPage(): React.JSX.Element {
  const {
    buildHref,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    selectedDate,
    setSelectedDate,
  } = useOperationsDate();

  const sectionCards = [
    {
      title: "Customer due & collection",
      href: buildHref("/operations/due-collection"),
      icon: FileCheck,
    },
    {
      title: "Daily chalans",
      href: buildHref("/operations/chalans"),
      icon: FileText,
    },
    {
      title: "Buyer purchases",
      href: buildHref("/operations/buyer-purchases"),
      icon: Home,
    },
    {
      title: "Chalan verification",
      href: buildHref("/operations/chalan-verification"),
      icon: PlusCircle,
    },
  ];

  return (
    <DailyOperationsShell
      buildHref={buildHref}
      currentPage="overview"
      description=""
      onNextDay={goToNextDay}
      onPreviousDay={goToPreviousDay}
      onSelectedDate={setSelectedDate}
      onToday={goToToday}
      selectedDate={selectedDate}
      title="Bill & Chalan"
    >
      <div className="grid gap-3 md:grid-cols-2">
        {sectionCards.map((card) => (
          <DailyOperationsLinkCard key={card.href} {...card} />
        ))}
      </div>
    </DailyOperationsShell>
  );
}
