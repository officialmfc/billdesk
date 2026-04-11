import { useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { FileText, PlusCircle } from "lucide-react-native";

import { AppSegmentedButtons } from "@/components/ui/AppSegmentedButtons";
import { EmptyState } from "@/components/ui/EmptyState";
import { OfflineReadOnlyBanner } from "@/components/ui/OfflineReadOnlyBanner";
import { PaperTextInput } from "@/components/ui/PaperTextInput";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SearchField } from "@/components/ui/SearchField";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { PaymentAccountCard } from "@/components/payments/PaymentAccountCard";
import { useConnectivity } from "@/hooks/useConnectivity";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { formatCurrency, getTodayDateString } from "@/lib/formatters";
import { appColors, appSpacing } from "@/lib/theme";
import { paymentsRepository } from "@/repositories/paymentsRepository";

type PaymentSegment = "customer" | "seller" | "spendings";

function formatTag(value: string): string {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function PaymentsScreenContent({
  initialSegment = "customer",
}: {
  initialSegment?: PaymentSegment;
}) {
  const router = useRouter();
  const { isOnline } = useConnectivity();
  const [segment, setSegment] = useState<PaymentSegment>(initialSegment);
  const [search, setSearch] = useState("");
  const [spendingDate, setSpendingDate] = useState(getTodayDateString());
  const { data: paymentsData } = useRepositoryData(
    () => paymentsRepository.getPaymentsOverview(search),
    [search]
  );
  const { data: spendingsData } = useRepositoryData(
    () => paymentsRepository.getSpendingsOverview(spendingDate, search),
    [search, spendingDate]
  );

  return (
    <ScreenLayout title="Payments" subtitle="">
      <OfflineReadOnlyBanner visible={!isOnline} />
      <View style={styles.actionRow}>
        <Text variant="titleLarge" style={styles.pageTitle}>
          Payments
        </Text>
        <Text variant="bodySmall" style={styles.segmentLabel}>
          {segment === "customer"
            ? "Customer"
            : segment === "seller"
              ? "Seller"
              : "Spendings"}
        </Text>
      </View>

      <AppSegmentedButtons
        value={segment}
        onValueChange={(value) => setSegment(value as PaymentSegment)}
        buttons={[
          { value: "customer", label: "Customer" },
          { value: "seller", label: "Seller" },
          { value: "spendings", label: "Spendings" },
        ]}
      />

      <SearchField
        placeholder={
          segment === "customer"
            ? "Search accounts, business, or reference"
            : segment === "seller"
              ? "Search sellers, business, or reference"
              : "Search title, category, note, or manager"
        }
        value={search}
        onChangeText={setSearch}
      />

      {segment === "spendings" ? (
        <>
          <View style={styles.spendingToolbar}>
            <PaperTextInput
              mode="outlined"
              label="Spent date"
              value={spendingDate}
              onChangeText={setSpendingDate}
              style={styles.spendingDateInput}
            />
            <Button mode="contained" onPress={() => router.push("/spending" as never)}>
              Add spend
            </Button>
          </View>

          <SectionHeader
            title="Spendings"
            description={`Total spend ${formatCurrency(spendingsData?.totalAmount ?? 0)}`}
          />

          {spendingsData?.categoryTotals.length ? (
            <View style={styles.chipRow}>
              {spendingsData.categoryTotals.map((entry) => (
                <View key={entry.category} style={styles.chip}>
                  <Text variant="labelSmall" style={styles.chipLabel}>
                    {formatTag(entry.category)}
                  </Text>
                  <Text variant="bodySmall" style={styles.mutedText}>
                    {formatCurrency(entry.totalAmount)} • {entry.count}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {spendingsData?.rows.length ? (
            spendingsData.rows.map((row) => (
              <SurfaceCard key={row.id} contentStyle={styles.spendingCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.copy}>
                    <Text variant="titleMedium">{row.title}</Text>
                    <Text variant="bodySmall" style={styles.mutedText}>
                      {row.spentDate} • {formatTag(row.category)} • {formatTag(row.paymentMethod)}
                    </Text>
                    {row.createdByName ? (
                      <Text variant="bodySmall" style={styles.mutedText}>
                        {row.createdByName}
                      </Text>
                    ) : null}
                  </View>
                  <Text variant="titleMedium">{formatCurrency(row.amount)}</Text>
                </View>
                {row.note ? (
                  <Text variant="bodySmall" style={styles.mutedText}>
                    {row.note}
                  </Text>
                ) : null}
              </SurfaceCard>
            ))
          ) : (
            <EmptyState
              title="No spendings"
              description="No synced spend rows matched this date and search."
              icon={PlusCircle}
            />
          )}
        </>
      ) : segment === "customer" ? (
        <>
          <View style={styles.quickActionRow}>
            <Button mode="contained-tonal" onPress={() => router.push("/payment" as never)}>
              Add payment
            </Button>
          </View>

          <SectionHeader
            title="Recent due customers"
            description="Most recent due dates first, with total due and last two due entries."
          />
          {paymentsData?.customerAccounts.length ? (
            paymentsData.customerAccounts.map((account) => (
              <PaymentAccountCard
                key={account.userId}
                account={account}
                actionLabel="Add payment"
                onActionPress={() =>
                  router.push({
                    pathname: "/payment",
                    params: { customerId: account.userId },
                  } as never)
                }
              />
            ))
          ) : (
            <EmptyState
              title="No customer accounts"
              description="No synced customer due accounts matched this search."
              icon={PlusCircle}
            />
          )}

          <SectionHeader
            title="Customer payment history"
            description={`Total due ${formatCurrency(paymentsData?.customerDueTotal ?? 0)}`}
          />
          {paymentsData?.customerHistory.slice(0, 20).map((row) => (
            <SurfaceCard key={row.id} contentStyle={styles.rowBetween}>
              <View style={styles.copy}>
                <Text variant="bodyLarge">{row.businessName || row.name}</Text>
                <Text variant="bodySmall" style={styles.mutedText}>
                  {row.reference} • {row.date} • {row.method}
                </Text>
              </View>
              <Text variant="titleSmall">{formatCurrency(row.amount)}</Text>
            </SurfaceCard>
          ))}
        </>
      ) : (
        <>
          <View style={styles.quickActionRow}>
            <Button mode="contained-tonal" onPress={() => router.push("/payout" as never)}>
              Add payout
            </Button>
          </View>

          <SectionHeader
            title="Recent seller dues"
            description="Latest challan due first, with recent due chips."
          />
          {paymentsData?.sellerAccounts.length ? (
            paymentsData.sellerAccounts.map((account) => (
              <PaymentAccountCard
                key={account.userId}
                account={account}
                actionLabel="Add payout"
                onActionPress={() =>
                  router.push({
                    pathname: "/payout",
                    params: { sellerId: account.userId },
                  } as never)
                }
              />
            ))
          ) : (
            <EmptyState
              title="No seller accounts"
              description="No synced seller payout accounts matched this search."
              icon={PlusCircle}
            />
          )}

          <SectionHeader
            title="Seller payout history"
            description={`Total due ${formatCurrency(paymentsData?.sellerDueTotal ?? 0)}`}
          />
          {paymentsData?.sellerHistory.slice(0, 20).map((row) => (
            <SurfaceCard key={row.id} contentStyle={styles.rowBetween}>
              <View style={styles.copy}>
                <Text variant="bodyLarge">{row.businessName || row.name}</Text>
                <Text variant="bodySmall" style={styles.mutedText}>
                  {row.reference} • {row.date} • {row.method}
                </Text>
              </View>
              <Text variant="titleSmall">{formatCurrency(row.amount)}</Text>
            </SurfaceCard>
          ))}
        </>
      )}

      {segment === "customer" && paymentsData?.customerHistory.length === 0 ? (
        <EmptyState
          title="No customer payment history"
          description="There are no synced customer payment rows for the current search."
          icon={FileText}
        />
      ) : null}

      {segment === "seller" && paymentsData?.sellerHistory.length === 0 ? (
        <EmptyState
          title="No seller payout history"
          description="There are no synced seller payout rows for the current search."
          icon={FileText}
        />
      ) : null}
    </ScreenLayout>
  );
}

export default function PaymentsScreen() {
  return <PaymentsScreenContent />;
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
  pageTitle: {
    fontWeight: "700",
  },
  segmentLabel: {
    color: appColors.mutedForeground,
  },
  quickActionRow: {
    alignItems: "flex-end",
  },
  spendingToolbar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: appSpacing.md,
  },
  spendingDateInput: {
    flex: 1,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    backgroundColor: appColors.secondarySurface,
    borderColor: appColors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipLabel: {
    color: appColors.foreground,
    textTransform: "uppercase",
  },
  spendingCard: {
    gap: appSpacing.sm,
  },
});
