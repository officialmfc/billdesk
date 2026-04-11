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
import { CreateCustomerPaymentDialog } from "@/components/payments/CreateCustomerPaymentDialog";
import { BuyerPurchasePrintContent } from "@/components/print/PrintPages";
import { PrintPreviewDialog } from "@/components/print/PrintPreviewDialog";
import { Button } from "@/components/ui/button";
import { ManagerDesktopBuyerPurchaseCard } from "@mfc/manager-ui";

export function BuyerPurchasesPage(): React.JSX.Element {
  const {
    buildHref,
    dateStr,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    selectedDate,
    setSelectedDate,
  } = useOperationsDate();
  const { buyerCards, loading, refetchAll } = useDailyOperationsData(dateStr);

  return (
    <DailyOperationsShell
      buildHref={buildHref}
      currentPage="buyer-purchases"
      description="Day-wise buyer register"
      onNextDay={goToNextDay}
      onPreviousDay={goToPreviousDay}
      onSelectedDate={setSelectedDate}
      onToday={goToToday}
      selectedDate={selectedDate}
      title="Buyer Purchases"
    >
      {loading ? (
        <DailyOperationsLoadingState />
      ) : (
        <>
          {buyerCards.length === 0 ? (
            <OperationsEmptyState
              title="No buyer purchases for this date"
              description="There are no buyer purchase groups synced for the selected operations date."
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {buyerCards.map((buyer) => (
                <ManagerDesktopBuyerPurchaseCard
                  key={buyer.customerId}
                  card={buyer}
                  action={
                    <div className="flex items-center justify-end gap-2">
                      <PrintPreviewDialog
                        previewTitle="Buyer bill sheet"
                        description="Preview the printable grouped buyer bill."
                        documentTitle="Buyer Bill"
                        paper="thermal"
                        trigger={<Button variant="outline" size="sm">Print</Button>}
                      >
                        <BuyerPurchasePrintContent card={buyer} date={dateStr} />
                      </PrintPreviewDialog>
                      {buyer.showAddPayment ? (
                        <CreateCustomerPaymentDialog
                          onSuccess={refetchAll}
                          presetCustomerId={buyer.customerId}
                          presetCustomerName={buyer.businessName || buyer.name}
                          presetPaymentDate={selectedDate}
                          triggerLabel="Add payment"
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
