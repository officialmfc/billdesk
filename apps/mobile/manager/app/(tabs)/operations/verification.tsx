import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PlusCircle } from "lucide-react-native";

import { ChalanRegisterCard } from "@/components/operations/ChalanRegisterCard";
import { DateNavigator } from "@/components/ui/DateNavigator";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { getTodayDateString, shiftDateString } from "@/lib/formatters";
import { operationsRepository } from "@/repositories/operationsRepository";

export default function ChalanVerificationScreen() {
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
    <ScreenLayout
      title="Chalan Verification"
      subtitle="Internal buyer-name check"
      showBack
      onBack={() => router.back()}
    >
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
              <ChalanRegisterCard key={card.chalan.id} card={card} showBuyerNames />
            ))
          ) : (
            <EmptyState
              title="No verification rows"
              description="There are no synced verification rows for the selected operations day."
              icon={PlusCircle}
            />
          )}
        </>
      ) : null}
    </ScreenLayout>
  );
}
