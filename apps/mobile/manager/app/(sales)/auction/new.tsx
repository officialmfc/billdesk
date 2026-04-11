import { useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { getManagerSaleFlowDefinition } from "@mfc/manager-ui";

import { AutocompleteSelectField } from "@/components/forms/AutocompleteSelectField";
import { SaleHeaderDateBadge } from "@/components/forms/SaleHeaderDateBadge";
import { SaleEntryHeaderCard } from "@/components/forms/SaleEntryHeaderCard";
import { SaleItemsPreviewTable } from "@/components/forms/SaleItemsPreviewTable";
import { SaleLineEditor } from "@/components/forms/SaleLineEditor";
import { OfflineReadOnlyBanner } from "@/components/ui/OfflineReadOnlyBanner";
import { MetricRow } from "@/components/ui/MetricRow";
import { PaperTextInput } from "@/components/ui/PaperTextInput";
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

const saleFlow = getManagerSaleFlowDefinition("auction");

function normalizeDecimalInput(value: string) {
  const normalized = value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  const [whole, ...rest] = normalized.split(".");

  if (rest.length === 0) {
    return whole;
  }

  return `${whole}.${rest.join("")}`;
}

function createLine(id: string, productDescription = ""): SaleLineDraft {
  return {
    id,
    weight: "",
    rate: "",
    productDescription,
  };
}

export default function AuctionSaleScreen() {
  const router = useRouter();
  const { isOnline } = useConnectivity();
  const { performFullSync } = useSync();
  const { data } = useRepositoryData(() => salesRepository.getFormLookups(), []);
  const [sellerId, setSellerId] = useState("");
  const [commissionPercentage, setCommissionPercentage] = useState("5");
  const [paidAmount, setPaidAmount] = useState("");
  const [chalanDate] = useState(getTodayDateString());
  const [items, setItems] = useState<SaleLineDraft[]>([createLine("line-1")]);
  const [pendingFocusLineId, setPendingFocusLineId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const lineRefs = useRef<Record<string, any>>({});
  const lineStackOffsetRef = useRef(0);
  const lineOffsetsRef = useRef<Record<string, number>>({});
  const commissionRef = useRef<any>(null);
  const paidAmountRef = useRef<any>(null);

  const registerLineRef = (lineId: string) => (node: any) => {
    if (node) {
      lineRefs.current[lineId] = node;
    } else {
      delete lineRefs.current[lineId];
    }
  };

  const focusLine = (lineId?: string) => {
    if (!lineId) {
      return;
    }

    setTimeout(() => {
      lineRefs.current[lineId]?.focus?.();
    }, 80);
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

  const appendLine = (productDescription = "") => {
    const id = `line-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    setPendingFocusLineId(id);
    setItems((current) => [...current, createLine(id, productDescription)]);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
      lineRefs.current[id]?.focus?.();
      setPendingFocusLineId((current) => (current === id ? null : current));
    }, 120);
  };

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.weight || 0) * Number(item.rate || 0), 0),
    [items]
  );
  const commissionRate = Number(commissionPercentage || 0);
  const roundedNetAmount = Math.floor((totalAmount - (totalAmount * commissionRate) / 100) / 5) * 5;
  const adjustedCommission = totalAmount - roundedNetAmount;
  const paidAmountValue = Number(paidAmount || 0);
  const balanceAfterPayment = Math.max(roundedNetAmount - paidAmountValue, 0);
  const formattedDate = new Date(chalanDate).toLocaleDateString("en-IN");

  const buyerLabels = useMemo(
    () => new Map((data?.userOptions ?? []).map((option) => [option.value, option.label])),
    [data?.userOptions]
  );

  const updateLine = (id: string, patch: Partial<SaleLineDraft>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleSubmit = async () => {
    if (!isOnline) {
      ErrorHandler.showWarning("Auction sales require connectivity.");
      return;
    }
    if (!sellerId) {
      ErrorHandler.showWarning("Select the seller for this auction.");
      return;
    }

    const saleItems = items
      .map((item) => ({
        buyer_id: item.buyerId,
        product_description: item.productDescription?.trim(),
        weight: Number(item.weight),
        rate: Number(item.rate),
      }))
      .filter(
        (item) =>
          Boolean(item.buyer_id) &&
          Boolean(item.product_description) &&
          item.weight > 0 &&
          item.rate > 0
      );

    if (!saleItems.length) {
      ErrorHandler.showWarning("Add at least one valid auction line.");
      return;
    }

    try {
      setSubmitting(true);
      await rpcService.createAuctionSale({
        p_seller_id: sellerId,
        p_sale_items: saleItems as Array<{
          buyer_id: string;
          product_description: string;
          weight: number;
          rate: number;
        }>,
        p_commission_percentage: Number(commissionPercentage || 0),
        p_paid_amount: paidAmount ? Number(paidAmount) : undefined,
        p_chalan_date: chalanDate,
      });
      await performFullSync();
      ErrorHandler.showSuccess("Auction sale created.");
      router.replace("/sales");
    } catch (error) {
      ErrorHandler.handle(error, "Auction sale");
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
          label="Seller name"
          placeholder="Search and select seller..."
          value={data?.userOptions.find((option) => option.value === sellerId)?.label}
          options={data?.userOptions ?? []}
          disabled={submitting}
          onFocus={handleFocusField}
          onClearSelection={() => setSellerId("")}
          onSubmitEditing={() => focusLine(items[0]?.id)}
          onSelect={(option) => setSellerId(option.value)}
        />
      </SaleEntryHeaderCard>

      <SectionHeader
        title={`Sale Items (${items.length})`}
        description="Buyer, product, weight, rate"
        action={
          <Button compact onPress={() => appendLine()} disabled={submitting}>
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
            buyerOptions={data?.userOptions ?? []}
            showBuyer
            showProductDescription
            layoutMode="auction"
            firstFieldRef={registerLineRef(item.id)}
            autoFocusFirstField={item.id === pendingFocusLineId}
            onFocusLine={handleLineFocus}
            onLineLayout={handleLineLayout}
            onSelectBuyer={(option) => updateLine(item.id, { buyerId: option.value })}
            onChange={(patch) => updateLine(item.id, patch)}
            onAddLine={() => appendLine(item.productDescription ?? "")}
            onSubmitRate={() => {
              const currentItem = items.find((row) => row.id === item.id);
              if (
                currentItem?.buyerId &&
                currentItem.productDescription?.trim() &&
                Number(currentItem.weight) > 0 &&
                Number(currentItem.rate) > 0
              ) {
                appendLine(currentItem.productDescription);
              }
            }}
            onRemove={() =>
              setItems((current) => (current.length > 1 ? current.filter((row) => row.id !== item.id) : current))
            }
          />
        ))}
      </View>

      <SurfaceCard style={styles.summaryCard} contentStyle={styles.summaryContent}>
        <SectionHeader title="Summary" description="Commission and payment" />

        <View style={styles.numericRow}>
          <PaperTextInput
            ref={commissionRef}
            mode="outlined"
            label="Commission %"
            keyboardType="default"
            value={commissionPercentage}
            onChangeText={(value: string) => setCommissionPercentage(normalizeDecimalInput(value))}
            onFocus={(event) => handleFocusField(event.nativeEvent.target)}
            onSubmitEditing={() => paidAmountRef.current?.focus?.()}
            returnKeyLabel="Next"
            returnKeyType="next"
            blurOnSubmit={false}
            disabled={submitting}
            style={styles.numericInput}
          />
          <PaperTextInput
            ref={paidAmountRef}
            mode="outlined"
            label="Paid amount"
            keyboardType="default"
            value={paidAmount}
            onChangeText={(value: string) => setPaidAmount(normalizeDecimalInput(value))}
            onFocus={(event) => handleFocusField(event.nativeEvent.target)}
            returnKeyLabel="Done"
            returnKeyType="done"
            disabled={submitting}
            style={styles.numericInput}
          />
        </View>

        <MetricRow label="Gross amount" value={formatCurrency(totalAmount)} />
        <MetricRow
          label={`Commission (${commissionRate}%)`}
          value={`- ${formatCurrency(adjustedCommission)}`}
        />
        <MetricRow label="Amount payable" value={formatCurrency(roundedNetAmount)} />
        <MetricRow label="Balance after payment" value={formatCurrency(balanceAfterPayment)} />
      </SurfaceCard>

      {items.length > 0 ? (
        <SaleItemsPreviewTable
          description="Live auction lines"
          columns={[
            { key: "index", label: "#", flex: 0.45 },
            { key: "product", label: "Product", flex: 1.5 },
            { key: "buyer", label: "Buyer", flex: 1.5 },
            { key: "weight", label: "Wt", flex: 0.9, align: "right" },
            { key: "rate", label: "Rate", flex: 0.9, align: "right" },
            { key: "total", label: "Total", flex: 1.15, align: "right" },
          ]}
          rows={items.map((item, index) => ({
            index: String(index + 1),
            product: item.productDescription?.trim() || "Pending",
            buyer: buyerLabels.get(item.buyerId ?? "") || "Pending",
            weight: Number(item.weight || 0) > 0 ? Number(item.weight).toFixed(2) : "-",
            rate: Number(item.rate || 0) > 0 ? Number(item.rate).toFixed(2) : "-",
            total: formatCurrency(Number(item.weight || 0) * Number(item.rate || 0)),
          }))}
        />
      ) : null}

      <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting || !isOnline}>
        Submit auction sale
      </Button>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  numericRow: {
    flexDirection: "row",
    gap: 12,
  },
  numericInput: {
    flex: 1,
  },
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
