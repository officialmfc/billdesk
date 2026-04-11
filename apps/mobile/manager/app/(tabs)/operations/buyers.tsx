import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Home } from "lucide-react-native";

import { BuyerPurchaseDailyCard } from "@/components/operations/BuyerPurchaseDailyCard";
import { DateNavigator } from "@/components/ui/DateNavigator";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { getTodayDateString, shiftDateString } from "@/lib/formatters";
import { printBuyerPurchaseBill } from "@/lib/mobile-print";
import { operationsRepository } from "@/repositories/operationsRepository";

export default function BuyerPurchasesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ dateStr?: string }>();
  const initialDate = useMemo(
    () => (typeof params.dateStr === "string" ? params.dateStr : getTodayDateString()),
    [params.dateStr]
  );
  const [dateStr, setDateStr] = useState(initialDate);
  const { data } = useRepositoryData(() => operationsRepository.getOperationsSummary(dateStr), [
    dateStr,
  ]);

  return (
    <ScreenLayout title="Buyer Purchases" subtitle="Day-wise buyer register" showBack onBack={() => router.back()}>
      <DateNavigator
        dateStr={dateStr}
        onPrevious={() => setDateStr((current) => shiftDateString(current, -1))}
        onNext={() => setDateStr((current) => shiftDateString(current, 1))}
        onSelectDate={setDateStr}
        onToday={() => setDateStr(getTodayDateString())}
      />

      {data ? (
        <>
          {data.buyerCards.length ? (
            data.buyerCards.map((card) => (
              <BuyerPurchaseDailyCard
                key={card.customerId}
                card={card}
                actionLabel="Add payment"
                onPrintPress={() => void printBuyerPurchaseBill(card, dateStr)}
                onActionPress={() =>
                  router.push({
                    pathname: "/payment",
                    params: { customerId: card.customerId },
                  } as never)
                }
              />
            ))
          ) : (
            <EmptyState
              title="No buyer purchases"
              description="There are no synced buyer purchase groups for the selected date."
              icon={Home}
            />
          )}
        </>
      ) : null}
    </ScreenLayout>
  );
}
