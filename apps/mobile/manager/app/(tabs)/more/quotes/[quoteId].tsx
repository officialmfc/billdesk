import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { FileCheck } from "lucide-react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { StatusChip } from "@/components/ui/StatusChip";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { formatCurrency } from "@/lib/formatters";
import { appColors } from "@/lib/theme";
import { quotesRepository } from "@/repositories/quotesRepository";

export default function QuoteDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ quoteId?: string }>();
  const quoteId = typeof params.quoteId === "string" ? params.quoteId : "";
  const { data } = useRepositoryData(() => quotesRepository.getQuoteDetail(quoteId), [quoteId]);

  if (!data) {
    return (
      <ScreenLayout title="Quote" subtitle="Not found" showBack onBack={() => router.back()}>
        <EmptyState
          title="Quote not found"
          description="The selected quote is not available in the local store."
          icon={FileCheck}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      title={data.summary.quoteNumber}
      subtitle={data.summary.businessName || data.summary.customerName}
      showBack
      onBack={() => router.back()}
    >
      <View style={styles.rowBetween}>
        <StatusChip
          label={data.summary.status}
          tone={data.summary.status === "confirmed" ? "success" : "warning"}
        />
        <Text variant="bodyMedium">{data.summary.deliveryDate}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.half}>
          <SummaryCard
            title="Total Amount"
            value={formatCurrency(data.summary.totalAmount)}
            note={`Seller ${data.summary.assignedSellerName}`}
            icon={FileCheck}
          />
        </View>
        <View style={styles.half}>
          <SummaryCard
            title="Advance Paid"
            value={formatCurrency(data.summary.advancePaid)}
            note="Captured in quote"
            icon={FileCheck}
          />
        </View>
      </View>

      <SurfaceCard contentStyle={styles.stack}>
          <Text variant="titleMedium">Items</Text>
          {data.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.copy}>
                <Text variant="bodyLarge">{item.product_name || item.product_description}</Text>
                <Text variant="bodySmall" style={styles.mutedText}>
                  {Number(item.weight_kg).toFixed(2)} kg • {formatCurrency(Number(item.price_per_kg))}
                  /kg
                </Text>
              </View>
                <Text variant="titleSmall">{formatCurrency(Number(item.line_total))}</Text>
            </View>
          ))}
          {data.summary.notes ? (
            <>
              <Text variant="titleSmall">Notes</Text>
              <Text variant="bodyMedium" style={styles.mutedText}>
                {data.summary.notes}
              </Text>
            </>
          ) : null}
      </SurfaceCard>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  half: {
    width: "48.2%",
  },
  stack: {
    gap: 12,
  },
  itemRow: {
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
