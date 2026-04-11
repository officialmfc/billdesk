"use client";

import { CreateSellerPaymentDialog } from "@/components/payments/CreateSellerPaymentDialog";
import {
  DailyOperationsShell,
  DailyOperationsLoadingState,
} from "@/components/operations/daily-operations-shared";
import {
  OperationsEmptyState,
} from "@/components/operations/operations-sleek-cards";
import { useDailyOperationsData } from "@/components/operations/useDailyOperationsData";
import { useOperationsDate } from "@/components/operations/useOperationsDate";
import { ChalanPrintContent } from "@/components/print/PrintPages";
import { PrintPreviewDialog } from "@/components/print/PrintPreviewDialog";
import { Button } from "@/components/ui/button";
import { ManagerDesktopChalanCard } from "@mfc/manager-ui";

export function DailyChalansPage(): React.JSX.Element {
  const {
    buildHref,
    dateStr,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    selectedDate,
    setSelectedDate,
  } = useOperationsDate();
  const { loading, refetchAll, verificationCards } =
    useDailyOperationsData(dateStr);

  return (
    <DailyOperationsShell
      buildHref={buildHref}
      currentPage="chalans"
      description="Seller register"
      onNextDay={goToNextDay}
      onPreviousDay={goToPreviousDay}
      onSelectedDate={setSelectedDate}
      onToday={goToToday}
      selectedDate={selectedDate}
      title="Daily Chalans"
    >
      {loading ? (
        <DailyOperationsLoadingState />
      ) : (
        <>
          {verificationCards.length === 0 ? (
            <OperationsEmptyState
              title="No chalans for this date"
              description="No synced chalans are available for the selected operations date."
            />
          ) : (
            <div className="space-y-3">
              {verificationCards.map((card) => (
                <ManagerDesktopChalanCard
                  key={card.chalan.id}
                  card={card}
                  showBuyerNames={false}
                  action={
                    <div className="flex items-center justify-end gap-2">
                      <PrintPreviewDialog
                        previewTitle="Chalan sheet"
                        description="Preview the printable seller chalan."
                        documentTitle="Chalan"
                        paper="thermal"
                        trigger={<Button variant="outline" size="sm">Print</Button>}
                      >
                        <ChalanPrintContent card={card} />
                      </PrintPreviewDialog>
                      {card.showRecordPayout ? (
                        <CreateSellerPaymentDialog
                          onSuccess={refetchAll}
                          presetSellerId={card.chalan.seller_id ?? undefined}
                          presetSellerName={card.sellerName}
                          triggerLabel="Record payout"
                          triggerSize="sm"
                          triggerVariant="outline"
                        />
                      ) : undefined}
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </DailyOperationsShell>
  );
}
