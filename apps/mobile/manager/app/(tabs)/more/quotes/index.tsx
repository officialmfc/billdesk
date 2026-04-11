import { useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { FileCheck } from "lucide-react-native";

import { AppSegmentedButtons } from "@/components/ui/AppSegmentedButtons";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricRow } from "@/components/ui/MetricRow";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SearchField } from "@/components/ui/SearchField";
import { StatusChip } from "@/components/ui/StatusChip";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useConnectivity } from "@/hooks/useConnectivity";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { formatCurrency } from "@/lib/formatters";
import { appColors } from "@/lib/theme";
import { quotesRepository } from "@/repositories/quotesRepository";

export default function QuotesScreen() {
  const router = useRouter();
  const { isOnline } = useConnectivity();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "confirmed">("all");
  const { data } = useRepositoryData(
    () => quotesRepository.getQuotes(search, status === "all" ? null : status),
    [search, status]
  );

  return (
    <ScreenLayout title="Quotes" subtitle="Pending and confirmed offers" showBack onBack={() => router.back()}>
      <Button mode="contained" disabled={!isOnline} onPress={() => router.push("/quote" as never)}>
        Create quote
      </Button>
      <SearchField placeholder="Search quotes or customers" value={search} onChangeText={setSearch} />
      <AppSegmentedButtons
        value={status}
        onValueChange={(value) => setStatus(value as "all" | "pending" | "confirmed")}
        buttons={[
          { value: "all", label: "All" },
          { value: "pending", label: "Pending" },
          { value: "confirmed", label: "Confirmed" },
        ]}
      />

      {data?.length ? (
        data.map((quote) => (
          <SurfaceCard
            key={quote.id}
            onPress={() => router.push(`/(tabs)/more/quotes/${quote.id}`)}
            contentStyle={styles.stack}
          >
            <View style={styles.rowBetween}>
              <View style={styles.copy}>
                <Text variant="titleMedium">{quote.quoteNumber}</Text>
                <Text variant="bodySmall" style={styles.mutedText}>
                  {quote.businessName || quote.customerName}
                </Text>
              </View>
              <StatusChip
                label={quote.status}
                tone={quote.status === "confirmed" ? "success" : "warning"}
              />
            </View>
            <MetricRow label="Delivery" value={quote.deliveryDate} />
            <MetricRow label="Assigned seller" value={quote.assignedSellerName} />
            <MetricRow label="Total amount" value={formatCurrency(quote.totalAmount)} />
          </SurfaceCard>
        ))
      ) : (
        <EmptyState
          title="No quotes found"
          description="No synced quote matched the selected filters."
          icon={FileCheck}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
});
