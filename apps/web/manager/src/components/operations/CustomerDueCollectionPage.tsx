"use client";

import { CreateCustomerPaymentDialog } from "@/components/payments/CreateCustomerPaymentDialog";
import {
  DailyOperationsShell,
  DailyOperationsLoadingState,
  formatOperationsCurrency,
} from "@/components/operations/daily-operations-shared";
import { OperationsEmptyState } from "@/components/operations/operations-sleek-cards";
import { useDailyOperationsData } from "@/components/operations/useDailyOperationsData";
import { useOperationsDate } from "@/components/operations/useOperationsDate";
import {
  ManagerDesktopDueCollectionCard,
  type ManagerDueCollectionCard,
} from "@mfc/manager-ui";
import type { ReactNode } from "react";

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
}): React.JSX.Element {
  const toneClass =
    tone === "danger"
      ? "border-red-200 bg-red-50 text-red-600"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
        : tone === "warning"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-border/70 bg-muted/60 text-muted-foreground";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${toneClass}`}>
      <span>{label}</span>
      {badge ? (
        <span className="ml-1.5 rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-foreground">
          {badge}
        </span>
      ) : null}
    </span>
  );
}

function WebMobileDueCollectionCard({
  action,
  card,
  section,
}: {
  action?: ReactNode;
  card: ManagerDueCollectionCard;
  section: "carry-forward" | "due-today";
}) {
  const chips: Array<{ badge?: string; label: string; tone: "danger" | "muted" | "success" | "warning" }> = [];

  if (card.selectedDateDue > 0) {
    chips.push({
      label: `Due today ${formatOperationsCurrency(card.selectedDateDue)}`,
      tone: "warning",
    });
  }

  if (card.selectedDatePayment > 0) {
    chips.push({
      label: `Paid today ${formatOperationsCurrency(card.selectedDatePayment)}`,
      tone: "success",
    });
  }

  if (section === "carry-forward") {
    if (card.recentDueEntries.length) {
      chips.push(
        ...card.recentDueEntries.slice(0, 2).map((entry, index) => ({
          badge: index === 0 ? "Latest" : undefined,
          label: `${formatShortDate(entry.date)} ${formatOperationsCurrency(entry.amount)}`,
          tone: "muted" as const,
        }))
      );
    } else if (card.latestDueDate) {
      chips.push({
        badge: "Latest",
        label: formatShortDate(card.latestDueDate),
        tone: "muted",
      });
    }
  }

  return (
    <div className="rounded-[20px] border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="truncate text-base font-semibold tracking-tight">
            {card.businessName || card.name}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {card.businessName ? card.name : "Customer account"}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Total Due
          </span>
          <span className="text-base font-bold text-red-600">
            {formatOperationsCurrency(card.totalDueTillDate)}
          </span>
        </div>
      </div>

      {chips.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <DueChip key={`${chip.badge ?? ""}-${chip.label}`} badge={chip.badge} label={chip.label} tone={chip.tone} />
          ))}
        </div>
      ) : null}

      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function CustomerDueCollectionPage(): React.JSX.Element {
  const {
    buildHref,
    dateStr,
    goToNextDay,
    goToPreviousDay,
    goToToday,
    selectedDate,
    setSelectedDate,
  } = useOperationsDate();
  const { dueRegister, loading, refetchAll } =
    useDailyOperationsData(dateStr, { forceRemoteHistory: true });

  return (
    <DailyOperationsShell
      buildHref={buildHref}
      currentPage="due-collection"
      description="Compact due register with payment actions inline."
      onNextDay={goToNextDay}
      onPreviousDay={goToPreviousDay}
      onSelectedDate={setSelectedDate}
      onToday={goToToday}
      selectedDate={selectedDate}
      title="Customer Due & Collection"
    >
      {loading ? (
        <DailyOperationsLoadingState />
      ) : (
        <>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Due Today</h2>
            {dueRegister.selectedDateCards.length === 0 ? (
              <OperationsEmptyState
                title="No due today"
                description="No newly due customer accounts for this date."
              />
            ) : (
              dueRegister.selectedDateCards.map((row) => (
                <div key={row.customerId}>
                  <div className="hidden md:block">
                    <ManagerDesktopDueCollectionCard
                      card={row}
                      section="due-today"
                      action={
                        <CreateCustomerPaymentDialog
                          onSuccess={refetchAll}
                          presetCustomerId={row.customerId}
                          presetCustomerName={row.businessName || row.name}
                          presetPaymentDate={selectedDate}
                          triggerLabel="Add payment"
                          triggerSize="sm"
                          triggerVariant="outline"
                        />
                      }
                    />
                  </div>
                  <div className="md:hidden">
                    <WebMobileDueCollectionCard
                      card={row}
                      section="due-today"
                      action={
                        <CreateCustomerPaymentDialog
                          onSuccess={refetchAll}
                          presetCustomerId={row.customerId}
                          presetCustomerName={row.businessName || row.name}
                          presetPaymentDate={selectedDate}
                          triggerLabel="Add payment"
                          triggerSize="sm"
                          triggerVariant="outline"
                        />
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Carry Forward</h2>
            {dueRegister.carryForwardCards.length === 0 ? (
              <OperationsEmptyState
                title="No carry forward"
                description="No older due accounts are waiting below this date."
              />
            ) : (
              dueRegister.carryForwardCards.map((row) => (
                <div key={row.customerId}>
                  <div className="hidden md:block">
                    <ManagerDesktopDueCollectionCard
                      card={row}
                      section="carry-forward"
                      action={
                        <CreateCustomerPaymentDialog
                          onSuccess={refetchAll}
                          presetCustomerId={row.customerId}
                          presetCustomerName={row.businessName || row.name}
                          presetPaymentDate={selectedDate}
                          triggerLabel="Add payment"
                          triggerSize="sm"
                          triggerVariant="outline"
                        />
                      }
                    />
                  </div>
                  <div className="md:hidden">
                    <WebMobileDueCollectionCard
                      card={row}
                      section="carry-forward"
                      action={
                        <CreateCustomerPaymentDialog
                          onSuccess={refetchAll}
                          presetCustomerId={row.customerId}
                          presetCustomerName={row.businessName || row.name}
                          presetPaymentDate={selectedDate}
                          triggerLabel="Add payment"
                          triggerSize="sm"
                          triggerVariant="outline"
                        />
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </DailyOperationsShell>
  );
}
