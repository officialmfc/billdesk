import { useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { FileCheck, FileText, Home, PlusCircle } from "lucide-react-native";

import { OperationsShortcutCard } from "@/components/operations/OperationsShortcutCard";
import { DateNavigator } from "@/components/ui/DateNavigator";
import { OfflineReadOnlyBanner } from "@/components/ui/OfflineReadOnlyBanner";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { useConnectivity } from "@/hooks/useConnectivity";
import { getTodayDateString, shiftDateString } from "@/lib/formatters";

export default function OperationsOverviewScreen() {
  const router = useRouter();
  const { isOnline } = useConnectivity();
  const [dateStr, setDateStr] = useState(getTodayDateString());

  return (
    <ScreenLayout title="Bill & Chalan" subtitle="Daily overview">
      <OfflineReadOnlyBanner visible={!isOnline} />
      <DateNavigator
        dateStr={dateStr}
        onPrevious={() => setDateStr((current) => shiftDateString(current, -1))}
        onNext={() => setDateStr((current) => shiftDateString(current, 1))}
        onSelectDate={setDateStr}
        onToday={() => setDateStr(getTodayDateString())}
      />

      <View style={styles.grid}>
        <View style={styles.half}>
          <OperationsShortcutCard
            title="Customer due & collection"
            icon={FileCheck}
            onPress={() => router.push({ pathname: "/operations/due", params: { dateStr } })}
          />
        </View>
        <View style={styles.half}>
          <OperationsShortcutCard
            title="Daily chalans"
            icon={FileText}
            onPress={() =>
              router.push({ pathname: "/operations/chalans", params: { dateStr } })
            }
          />
        </View>
        <View style={styles.half}>
          <OperationsShortcutCard
            title="Buyer purchases"
            icon={Home}
            onPress={() =>
              router.push({ pathname: "/operations/buyers", params: { dateStr } })
            }
          />
        </View>
        <View style={styles.half}>
          <OperationsShortcutCard
            title="Chalan verification"
            icon={PlusCircle}
            onPress={() =>
              router.push({
                pathname: "/operations/verification",
                params: { dateStr },
              })
            }
          />
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  half: {
    width: "48.2%",
  },
});
