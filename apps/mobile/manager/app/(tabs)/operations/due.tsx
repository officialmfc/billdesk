import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { FileText, Wallet } from "lucide-react-native";

import { DateNavigator } from "@/components/ui/DateNavigator";
import { EmptyState } from "@/components/ui/EmptyState";
import { OfflineReadOnlyBanner } from "@/components/ui/OfflineReadOnlyBanner";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useConnectivity } from "@/hooks/useConnectivity";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { formatCurrency, getTodayDateString, shiftDateString } from "@/lib/formatters";
import { appColors } from "@/lib/theme";
import { operationsRepository } from "@/repositories/operationsRepository";

type DueCardRow = Awaited<ReturnType<typeof operationsRepository.getOperationsSummary>>["dueRegister"]["selectedDateCards"][number];

function formatShortDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
  });
}

function DueChip({
  badge,
  label,
  tone,
}: {
  badge?: string;
  label: string;
  tone: "danger" | "muted" | "success" | "warning";
}) {
  const toneStyle =
    tone === "danger"
      ? styles.chipDanger
      : tone === "success"
        ? styles.chipSuccess
        : tone === "warning"
          ? styles.chipWarning
          : styles.chipMuted;

  return (
    <View style={[styles.chip, toneStyle]}>
      <Text variant="labelSmall" style={styles.chipText}>
        {label}
      </Text>
      {badge ? (
        <View style={styles.chipBadge}>
          <Text variant="labelSmall" style={styles.chipBadgeText}>
            {badge}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function DueCollectionCard({
  actionLabel,
  disabled,
  onActionPress,
  row,
  section,
}: {
  actionLabel: string;
  disabled?: boolean;
  onActionPress: () => void;
  row: DueCardRow;
  section: "carry-forward" | "due-today";
}) {
  const chips: Array<{ badge?: string; label: string; tone: "danger" | "muted" | "success" | "warning" }> = [];

  if (row.selectedDateDue > 0) {
    chips.push({
      label: `Due today ${formatCurrency(row.selectedDateDue)}`,
      tone: "warning",
    });
  }

  if (row.selectedDatePayment > 0) {
    chips.push({
      label: `Paid today ${formatCurrency(row.selectedDatePayment)}`,
      tone: "success",
    });
  }

  if (section === "carry-forward") {
    if (row.recentDueEntries.length) {
      chips.push(
        ...row.recentDueEntries.slice(0, 2).map((entry, index) => ({
          badge: index === 0 ? "Latest" : undefined,
          label: `${formatShortDate(entry.date)} ${formatCurrency(entry.amount)}`,
          tone: "muted" as const,
        }))
      );
    } else if (row.latestDueDate) {
      chips.push({
        badge: "Latest",
        label: formatShortDate(row.latestDueDate),
        tone: "muted",
      });
    }
  }

  return (
    <SurfaceCard contentStyle={styles.cardStack}>
      <View style={styles.rowBetween}>
        <View style={styles.copy}>
          <Text variant="titleMedium">{row.businessName || row.name}</Text>
          <Text variant="bodySmall" style={styles.mutedText}>
            {row.businessName ? row.name : "Customer account"}
          </Text>
        </View>
        <View style={styles.totalDueBlock}>
          <Text variant="labelSmall" style={styles.metricLabel}>
            Total due
          </Text>
          <Text variant="titleMedium" style={styles.dueValue}>
            {formatCurrency(row.totalDueTillDate)}
          </Text>
        </View>
      </View>

      {chips.length ? (
        <View style={styles.chipRow}>
          {chips.map((chip) => (
            <DueChip
              key={`${chip.badge ?? ""}-${chip.label}`}
              badge={chip.badge}
              label={chip.label}
              tone={chip.tone}
            />
          ))}
        </View>
      ) : null}

      <Button mode="outlined" disabled={disabled} onPress={onActionPress}>
        {actionLabel}
      </Button>
    </SurfaceCard>
  );
}

export default function DueCollectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ dateStr?: string }>();
  const initialDate = useMemo(
    () => (typeof params.dateStr === "string" ? params.dateStr : getTodayDateString()),
    [params.dateStr]
  );
  const [dateStr, setDateStr] = useState(initialDate);
  const { isOnline } = useConnectivity();
  const { data } = useRepositoryData(
    () => operationsRepository.getOperationsSummary(dateStr),
    [dateStr]
  );

  const summary = data;

  return (
    <ScreenLayout
      title="Customer Due & Collection"
      subtitle="Compact due register"
      showBack
      onBack={() => router.back()}
    >
      <OfflineReadOnlyBanner visible={!isOnline} />
      <DateNavigator
        dateStr={dateStr}
        onPrevious={() => setDateStr((current) => shiftDateString(current, -1))}
        onNext={() => setDateStr((current) => shiftDateString(current, 1))}
        onSelectDate={setDateStr}
        onToday={() => setDateStr(getTodayDateString())}
      />

      {summary ? (
        <>
          <SectionHeader
            title="Due Today"
            description="Newly due customer accounts for the selected day."
          />

          {summary.dueRegister.selectedDateCards.length ? (
            summary.dueRegister.selectedDateCards.map((row) => (
              <DueCollectionCard
                key={row.customerId}
                actionLabel="Add payment"
                disabled={!isOnline}
                onActionPress={() =>
                  router.push({
                    pathname: "/payment",
                    params: { customerId: row.customerId },
                  } as never)
                }
                row={row}
                section="due-today"
              />
            ))
          ) : (
            <EmptyState
              title="No due today"
              description="No newly due customer accounts for this date."
              icon={Wallet}
            />
          )}

          <SectionHeader
            title="Carry Forward"
            description="Older due cards, latest pending date first."
          />

          {summary.dueRegister.carryForwardCards.length ? (
            summary.dueRegister.carryForwardCards.map((row) => (
              <DueCollectionCard
                key={row.customerId}
                actionLabel="Add payment"
                disabled={!isOnline}
                onActionPress={() =>
                  router.push({
                    pathname: "/payment",
                    params: { customerId: row.customerId },
                  } as never)
                }
                row={row}
                section="carry-forward"
              />
            ))
          ) : (
            <EmptyState
              title="No carry forward"
              description="No older due accounts are waiting below this date."
              icon={FileText}
            />
          )}
        </>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  cardStack: {
    gap: 12,
  },
  rowBetween: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
  dueValue: {
    color: appColors.danger,
    fontWeight: "700",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    alignItems: "center",
    borderColor: appColors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipBadge: {
    backgroundColor: appColors.background,
    borderColor: appColors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  chipText: {
    fontWeight: "700",
  },
  chipDanger: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  chipMuted: {
    backgroundColor: appColors.secondarySurface,
    borderColor: appColors.border,
  },
  chipSuccess: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  chipWarning: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  metricLabel: {
    color: appColors.mutedForeground,
    textTransform: "uppercase",
  },
  totalDueBlock: {
    alignItems: "flex-end",
    gap: 2,
  },
});
