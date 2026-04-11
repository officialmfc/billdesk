import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FileText } from "lucide-react-native";

import { ChalanRegisterCard } from "@/components/operations/ChalanRegisterCard";
import { DateNavigator } from "@/components/ui/DateNavigator";
import { EmptyState } from "@/components/ui/EmptyState";
import { OfflineReadOnlyBanner } from "@/components/ui/OfflineReadOnlyBanner";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { useConnectivity } from "@/hooks/useConnectivity";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { getTodayDateString, shiftDateString } from "@/lib/formatters";
import { printChalanSheet } from "@/lib/mobile-print";
import { operationsRepository } from "@/repositories/operationsRepository";

export default function DailyChalansScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ dateStr?: string }>();
  const initialDate = useMemo(
    () => (typeof params.dateStr === "string" ? params.dateStr : getTodayDateString()),
    [params.dateStr]
  );
  const [dateStr, setDateStr] = useState(initialDate);
  const { isOnline } = useConnectivity();
  const { data } = useRepositoryData(() => operationsRepository.getOperationsSummary(dateStr), [
    dateStr,
  ]);

  return (
    <ScreenLayout title="Daily Chalans" subtitle="Seller register" showBack onBack={() => router.back()}>
      <OfflineReadOnlyBanner visible={!isOnline} />
      <DateNavigator
        dateStr={dateStr}
        onPrevious={() => setDateStr((current) => shiftDateString(current, -1))}
        onNext={() => setDateStr((current) => shiftDateString(current, 1))}
        onSelectDate={setDateStr}
        onToday={() => setDateStr(getTodayDateString())}
      />

      {data ? (
        <>
          {data.verificationCards.length ? (
            data.verificationCards.map((card) => (
              <ChalanRegisterCard
                key={card.chalan.id}
                card={card}
                showBuyerNames={false}
                actionLabel="Record payout"
                onPrintPress={() => void printChalanSheet(card)}
                actionDisabled={!isOnline}
                onActionPress={() =>
                  router.push({
                    pathname: "/payout",
                    params: {
                      sellerId: card.chalan.seller_id ?? "",
                      chalanId: card.chalan.id,
                    },
                  } as never)
                }
              />
            ))
          ) : (
            <EmptyState
              title="No chalans for this date"
              description="No synced chalans are available for the selected operations day."
              icon={FileText}
            />
          )}
        </>
      ) : null}
    </ScreenLayout>
  );
}
