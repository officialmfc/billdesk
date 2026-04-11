import { useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { getManagerSaleFlowDefinition } from "@mfc/manager-ui";

import { AutocompleteSelectField } from "@/components/forms/AutocompleteSelectField";
import { SaleHeaderDateBadge } from "@/components/forms/SaleHeaderDateBadge";
import { SaleItemsPreviewTable } from "@/components/forms/SaleItemsPreviewTable";
import { SaleEntryHeaderCard } from "@/components/forms/SaleEntryHeaderCard";
import { SaleLineEditor } from "@/components/forms/SaleLineEditor";
import { OfflineReadOnlyBanner } from "@/components/ui/OfflineReadOnlyBanner";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useSync } from "@/contexts/SyncContext";
import { useConnectivity } from "@/hooks/useConnectivity";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { ErrorHandler } from "@/lib/error-handler";
import { formatCurrency, getTodayDateString } from "@/lib/formatters";
import { scrollInputIntoView } from "@/lib/scroll-input-into-view";
import { appColors } from "@/lib/theme";
import { rpcService } from "@/lib/rpc-service";
import { salesRepository } from "@/repositories/salesRepository";
import type { SaleLineDraft } from "@/repositories/types";

const saleFlow = getManagerSaleFlowDefinition("direct");

function createLine(id: string): SaleLineDraft {
  return {
    id,
    weight: "",
    rate: "",
  };
}

export default function DirectSaleScreen() {
  const router = useRouter();
  const { isOnline } = useConnectivity();
  const { performFullSync } = useSync();
  const { data } = useRepositoryData(() => salesRepository.getFormLookups(), []);
  const [buyerId, setBuyerId] = useState("");
  const [saleDate] = useState(getTodayDateString());
  const [items, setItems] = useState<SaleLineDraft[]>([createLine("line-1")]);
  const [pendingFocusLineId, setPendingFocusLineId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const lineRefs = useRef<Record<string, any>>({});
  const lineStackOffsetRef = useRef(0);
  const lineOffsetsRef = useRef<Record<string, number>>({});

  const registerLineRef = (lineId: string) => (node: any) => {
    if (node) {
      lineRefs.current[lineId] = node;
    } else {
      delete lineRefs.current[lineId];
    }
  };

  const appendLine = () => {
    const id = `line-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    setPendingFocusLineId(id);
    setItems((current) => [...current, createLine(id)]);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
      lineRefs.current[id]?.focus?.();
      setPendingFocusLineId((current) => (current === id ? null : current));
    }, 80);
  };

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.weight || 0) * Number(item.rate || 0), 0),
    [items]
  );
  const formattedDate = new Date(saleDate).toLocaleDateString("en-IN");
  const sellerLabels = useMemo(
    () => new Map((data?.mfcSellers ?? []).map((option) => [option.value, option.label])),
    [data?.mfcSellers]
  );
  const batchLabels = useMemo(
    () => new Map((data?.stockBatches ?? []).map((option) => [option.value, option.label])),
    [data?.stockBatches]
  );

  const updateLine = (id: string, patch: Partial<SaleLineDraft>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleFocusField = (node: any) => {
    scrollInputIntoView(scrollRef, node);
  };

  const handleLineLayout = (lineId: string, y: number) => {
    lineOffsetsRef.current[lineId] = y;
  };

  const handleLineFocus = (lineId: string) => {
    const y = lineOffsetsRef.current[lineId];

    if (typeof y !== "number") {
      return;
    }

    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, lineStackOffsetRef.current + y - 8),
        animated: true,
      });
    }, 120);
  };

  const handleSubmit = async () => {
    if (!isOnline) {
      ErrorHandler.showWarning("Direct sales require connectivity.");
      return;
    }
    if (!buyerId) {
      ErrorHandler.showWarning("Select the buyer for this sale.");
      return;
    }

    const saleItems = items
      .map((item) => ({
        stock_batch_id: item.batchId,
        product_id: item.productId,
        weight: Number(item.weight),
        rate: Number(item.rate),
        mfc_seller_id: item.sellerId,
      }))
      .filter(
        (item) =>
          Boolean(item.stock_batch_id) &&
          Boolean(item.product_id) &&
          Boolean(item.mfc_seller_id) &&
          item.weight > 0 &&
          item.rate > 0
      );

    if (!saleItems.length) {
      ErrorHandler.showWarning("Add at least one valid stock line.");
      return;
    }

    try {
      setSubmitting(true);
      await rpcService.createSaleForSingleCustomer({
        p_buyer_id: buyerId,
        p_sale_items: saleItems as Array<{
          stock_batch_id: string;
          product_id: string;
          weight: number;
          rate: number;
          mfc_seller_id: string;
        }>,
        p_sale_date: saleDate,
      });
      await performFullSync();
      ErrorHandler.showSuccess("Direct sale created.");
      router.replace("/sales");
    } catch (error) {
      ErrorHandler.handle(error, "Direct sale");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout
      title={saleFlow.mobileScreenTitle}
      showBack
      onBack={() => router.back()}
      scrollRef={scrollRef}
      rightAction={<SaleHeaderDateBadge dateLabel={formattedDate} />}
    >
      <OfflineReadOnlyBanner visible={!isOnline} />

      <SaleEntryHeaderCard>
        <AutocompleteSelectField
          label="Buyer name"
          placeholder="Search and select buyer..."
          value={data?.userOptions.find((option) => option.value === buyerId)?.label}
          options={data?.userOptions ?? []}
          disabled={submitting}
          onFocus={handleFocusField}
          onClearSelection={() => setBuyerId("")}
          onSubmitEditing={() => lineRefs.current[items[0]?.id ?? ""]?.focus?.()}
          onSelect={(option) => setBuyerId(option.value)}
        />
      </SaleEntryHeaderCard>

      <SectionHeader
        title={`Sale Items (${items.length})`}
        description="MFC seller, stock batch, weight, rate"
        action={
          <Button compact onPress={appendLine} disabled={submitting}>
            Add line
          </Button>
        }
      />

      <View
        style={styles.stack}
        onLayout={(event) => {
          lineStackOffsetRef.current = event.nativeEvent.layout.y;
        }}
      >
        {items.map((item, index) => (
          <SaleLineEditor
            key={item.id}
            index={index}
            line={item}
            disabled={submitting}
            showBuyer={false}
            showSeller
            showBatch
            showProductDescription={false}
            layoutMode="direct"
            sellerLabel="MFC seller"
            firstFieldRef={registerLineRef(item.id)}
            autoFocusFirstField={item.id === pendingFocusLineId}
            onFocusLine={handleLineFocus}
            onLineLayout={handleLineLayout}
            sellerOptions={data?.mfcSellers ?? []}
            batchOptions={data?.stockBatches ?? []}
            onSelectSeller={(option) => updateLine(item.id, { sellerId: option.value })}
            onSelectBatch={(option) =>
              updateLine(item.id, {
                batchId: option.value,
                productId: option.productId,
                productDescription: option.productName || option.label,
                sellerId: option.mfcSellerId || item.sellerId,
              })
            }
            onChange={(patch) => updateLine(item.id, patch)}
            onAddLine={appendLine}
            onSubmitRate={() => {
              const currentItem = items.find((row) => row.id === item.id);
              if (
                currentItem?.sellerId &&
                currentItem.batchId &&
                currentItem.productId &&
                Number(currentItem.weight) > 0 &&
                Number(currentItem.rate) > 0
              ) {
                appendLine();
              }
            }}
            onRemove={() =>
              setItems((current) => (current.length > 1 ? current.filter((row) => row.id !== item.id) : current))
            }
          />
        ))}
      </View>

      <SurfaceCard style={styles.summaryCard} contentStyle={styles.summaryContent}>
        <Text variant="titleMedium">Sale total</Text>
        <Text variant="headlineSmall">{formatCurrency(totalAmount)}</Text>
        <Text variant="bodySmall" style={styles.mutedText}>
          {items.length} lines for the selected buyer
        </Text>
      </SurfaceCard>

      {items.length > 0 ? (
        <SaleItemsPreviewTable
          description="Live direct-sale lines"
          columns={[
            { key: "index", label: "#", flex: 0.45 },
            { key: "seller", label: "Seller", flex: 1.4 },
            { key: "batch", label: "Batch", flex: 1.4 },
            { key: "weight", label: "Wt", flex: 0.9, align: "right" },
            { key: "rate", label: "Rate", flex: 0.9, align: "right" },
            { key: "total", label: "Total", flex: 1.15, align: "right" },
          ]}
          rows={items.map((item, index) => ({
            index: String(index + 1),
            seller: sellerLabels.get(item.sellerId ?? "") || "Pending",
            batch: batchLabels.get(item.batchId ?? "") || "Pending",
            weight: Number(item.weight || 0) > 0 ? Number(item.weight).toFixed(2) : "-",
            rate: Number(item.rate || 0) > 0 ? Number(item.rate).toFixed(2) : "-",
            total: formatCurrency(Number(item.weight || 0) * Number(item.rate || 0)),
          }))}
        />
      ) : null}

      <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting || !isOnline}>
        Submit direct sale
      </Button>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: appColors.primarySoft,
  },
  summaryContent: {
    gap: 6,
  },
  stack: {
    gap: 12,
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
});
