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

const saleFlow = getManagerSaleFlowDefinition("batch");

function createLine(id: string): SaleLineDraft {
  return {
    id,
    weight: "",
    rate: "",
  };
}

export default function BatchSaleScreen() {
  const router = useRouter();
  const { isOnline } = useConnectivity();
  const { performFullSync } = useSync();
  const { data } = useRepositoryData(() => salesRepository.getFormLookups(), []);
  const [sellerId, setSellerId] = useState("");
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

  const batchOptions = useMemo(() => {
    if (!data?.stockBatches) {
      return [];
    }
    if (!sellerId) {
      return data.stockBatches;
    }
    return data.stockBatches.filter((batch) => !batch.mfcSellerId || batch.mfcSellerId === sellerId);
  }, [data?.stockBatches, sellerId]);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.weight || 0) * Number(item.rate || 0), 0),
    [items]
  );
  const formattedDate = new Date(saleDate).toLocaleDateString("en-IN");
  const buyerLabels = useMemo(
    () => new Map((data?.userOptions ?? []).map((option) => [option.value, option.label])),
    [data?.userOptions]
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
      ErrorHandler.showWarning("Batch sales require connectivity.");
      return;
    }
    if (!sellerId) {
      ErrorHandler.showWarning("Select the assigned MFC seller.");
      return;
    }

    const saleItems = items
      .map((item) => ({
        buyer_id: item.buyerId,
        stock_batch_id: item.batchId,
        product_id: item.productId,
        weight: Number(item.weight),
        rate: Number(item.rate),
      }))
      .filter(
        (item) =>
          Boolean(item.buyer_id) &&
          Boolean(item.stock_batch_id) &&
          Boolean(item.product_id) &&
          item.weight > 0 &&
          item.rate > 0
      );

    if (!saleItems.length) {
      ErrorHandler.showWarning("Add at least one valid batch sale line.");
      return;
    }

    try {
      setSubmitting(true);
      await rpcService.createSellerBatchSale({
        p_mfc_seller_id: sellerId,
        p_sale_items: saleItems as Array<{
          buyer_id: string;
          stock_batch_id: string;
          product_id: string;
          weight: number;
          rate: number;
        }>,
        p_sale_date: saleDate,
      });
      await performFullSync();
      ErrorHandler.showSuccess("Batch sale created.");
      router.replace("/sales");
    } catch (error) {
      ErrorHandler.handle(error, "Batch sale");
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
          label="MFC seller"
          placeholder="Search and select MFC seller..."
          value={data?.mfcSellers.find((option) => option.value === sellerId)?.label}
          options={data?.mfcSellers ?? []}
          disabled={submitting}
          onFocus={handleFocusField}
          onClearSelection={() => setSellerId("")}
          onSubmitEditing={() => lineRefs.current[items[0]?.id ?? ""]?.focus?.()}
          onSelect={(option) => setSellerId(option.value)}
        />
      </SaleEntryHeaderCard>

      <SectionHeader
        title={`Sale Items (${items.length})`}
        description="Buyer, stock batch, weight, rate"
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
            showBuyer
            showBatch
            showProductDescription={false}
            layoutMode="batch"
            firstFieldRef={registerLineRef(item.id)}
            autoFocusFirstField={item.id === pendingFocusLineId}
            onFocusLine={handleLineFocus}
            onLineLayout={handleLineLayout}
            buyerOptions={data?.userOptions ?? []}
            batchOptions={batchOptions}
            onSelectBuyer={(option) => updateLine(item.id, { buyerId: option.value })}
            onSelectBatch={(option) =>
              updateLine(item.id, {
                batchId: option.value,
                productId: option.productId,
                productDescription: option.productName || option.label,
              })
            }
            onChange={(patch) => updateLine(item.id, patch)}
            onAddLine={appendLine}
            onSubmitRate={() => {
              const currentItem = items.find((row) => row.id === item.id);
              if (
                currentItem?.buyerId &&
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
          {items.length} batch lines
        </Text>
      </SurfaceCard>

      {items.length > 0 ? (
        <SaleItemsPreviewTable
          description="Live batch-sale lines"
          columns={[
            { key: "index", label: "#", flex: 0.45 },
            { key: "batch", label: "Batch", flex: 1.35 },
            { key: "buyer", label: "Buyer", flex: 1.45 },
            { key: "weight", label: "Wt", flex: 0.9, align: "right" },
            { key: "rate", label: "Rate", flex: 0.9, align: "right" },
            { key: "total", label: "Total", flex: 1.15, align: "right" },
          ]}
          rows={items.map((item, index) => ({
            index: String(index + 1),
            batch: batchLabels.get(item.batchId ?? "") || "Pending",
            buyer: buyerLabels.get(item.buyerId ?? "") || "Pending",
            weight: Number(item.weight || 0) > 0 ? Number(item.weight).toFixed(2) : "-",
            rate: Number(item.rate || 0) > 0 ? Number(item.rate).toFixed(2) : "-",
            total: formatCurrency(Number(item.weight || 0) * Number(item.rate || 0)),
          }))}
        />
      ) : null}

      <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting || !isOnline}>
        Submit batch sale
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
