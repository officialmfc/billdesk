"use client";

import {
  DailyOperationsShell,
  DailyOperationsLoadingState,
} from "@/components/operations/daily-operations-shared";
import {
  OperationsEmptyState,
} from "@/components/operations/operations-sleek-cards";
import { useDailyOperationsData } from "@/components/operations/useDailyOperationsData";
import { useOperationsDate } from "@/components/operations/useOperationsDate";
import { ManagerDesktopChalanCard } from "@mfc/manager-ui";

export function ChalanVerificationPage(): React.JSX.Element {
  const {
    buildHref,
    dateStr,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    selectedDate,
    setSelectedDate,
  } = useOperationsDate();
  const { loading, verificationCards } =
    useDailyOperationsData(dateStr);

  return (
    <DailyOperationsShell
      buildHref={buildHref}
      currentPage="verification"
      description="Buyer line check"
      onNextDay={goToNextDay}
      onPreviousDay={goToPreviousDay}
      onSelectedDate={setSelectedDate}
      onToday={goToToday}
      selectedDate={selectedDate}
      title="Chalan Verification"
    >
      {loading ? (
        <DailyOperationsLoadingState />
      ) : (
        <>
          {verificationCards.length === 0 ? (
            <OperationsEmptyState
              title="No verification cards for this date"
              description="No synced chalans were found for the selected operations date."
            />
          ) : (
            <div className="space-y-3">
              {verificationCards.map((card) => (
                <ManagerDesktopChalanCard
                  key={card.chalan.id}
                  card={card}
                  showBuyerNames
                />
              ))}
            </div>
          )}
        </>
      )}
    </DailyOperationsShell>
  );
}
