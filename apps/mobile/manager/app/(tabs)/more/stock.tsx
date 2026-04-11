import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { QuoteItemEditor } from "@/components/forms/QuoteItemEditor";
import { SelectModalField } from "@/components/forms/SelectModalField";
import { SearchField } from "@/components/ui/SearchField";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SheetTable } from "@/components/ui/SheetTable";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { PaperTextInput } from "@/components/ui/PaperTextInput";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { useSync } from "@/contexts/SyncContext";
import { ErrorHandler } from "@/lib/error-handler";
import { formatCurrency, formatLongDate, getTodayDateString } from "@/lib/formatters";
import { rpcService } from "@/lib/rpc-service";
import { appColors } from "@/lib/theme";
import { adminRepository } from "@/repositories/adminRepository";
import type { QuoteItemDraft } from "@/repositories/types";

function createLine(id: string): QuoteItemDraft {
  return {
    id,
    pricePerKg: "",
    weightKg: "",
  };
}

export default function StockScreen() {
  const router = useRouter();
  const { performFullSync } = useSync();
  const [search, setSearch] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(getTodayDateString());
  const [commission, setCommission] = useState("5");
  const [items, setItems] = useState<QuoteItemDraft[]>([createLine("stock-1")]);
  const [saving, setSaving] = useState(false);
  const { data, reload } = useRepositoryData(() => adminRepository.getStockOverview(search), [search]);

  const productOptions = useMemo(() => data?.products ?? [], [data?.products]);

  const updateItem = (id: string, patch: Partial<QuoteItemDraft>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleCreate = async () => {
    const commissionPercentage = Number(commission);
    const preparedItems = items
      .map((item) => ({
        product_id: item.productId,
        product_description: (item.productDescription || "").trim(),
        rate: Number(item.pricePerKg),
        weight: Number(item.weightKg),
      }))
      .filter(
        (item) =>
          Boolean(item.product_id) &&
          Boolean(item.product_description) &&
          Number.isFinite(item.weight) &&
          item.weight > 0 &&
          Number.isFinite(item.rate) &&
          item.rate > 0
      );

    if (!supplierId || !sellerId) {
      ErrorHandler.showWarning("Select supplier and assigned MFC seller.");
      return;
    }

    if (!preparedItems.length) {
      ErrorHandler.showWarning("Add at least one valid stock item.");
      return;
    }

    if (!Number.isFinite(commissionPercentage) || commissionPercentage < 0) {
      ErrorHandler.showWarning("Commission percentage is invalid.");
      return;
    }

    try {
      setSaving(true);
      await rpcService.purchaseStockFromSeller({
        p_commission_percentage: commissionPercentage,
        p_mfc_seller_id_to_assign: sellerId,
        p_purchase_date: purchaseDate,
        p_purchase_items: preparedItems as Array<{
          product_id: string;
          product_description: string;
          rate: number;
          weight: number;
        }>,
        p_seller_id: supplierId,
      });
      await performFullSync();
      await reload();
      setSupplierId("");
      setSellerId("");
      setPurchaseDate(getTodayDateString());
      setCommission("5");
      setItems([createLine("stock-1")]);
      ErrorHandler.showSuccess("Stock batches created.");
    } catch (error) {
      ErrorHandler.handle(error, "Create stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout title="Stock" subtitle="Batch inventory and fresh stock intake" showBack onBack={() => router.back()}>
      <SearchField placeholder="Search stock batches..." value={search} onChangeText={setSearch} />

      <SurfaceCard contentStyle={styles.stack}>
        <Text variant="titleMedium">Create Stock Batches</Text>
        <SelectModalField
          label="Supplier"
          placeholder="Select supplier"
          value={data?.suppliers.find((option) => option.value === supplierId)?.label}
          options={data?.suppliers ?? []}
          onSelect={(option) => setSupplierId(option.value)}
        />
        <SelectModalField
          label="Assign to MFC seller"
          placeholder="Select MFC seller"
          value={data?.sellers.find((option) => option.value === sellerId)?.label}
          options={data?.sellers ?? []}
          onSelect={(option) => setSellerId(option.value)}
        />
        <View style={styles.inlineRow}>
          <PaperTextInput
            mode="outlined"
            label="Purchase date"
            value={purchaseDate}
            onChangeText={setPurchaseDate}
            style={styles.inlineField}
          />
          <PaperTextInput
            mode="outlined"
            label="Commission %"
            keyboardType="decimal-pad"
            value={commission}
            onChangeText={setCommission}
            style={styles.inlineField}
          />
        </View>

        <View style={styles.stack}>
          {items.map((item, index) => (
            <QuoteItemEditor
              key={item.id}
              index={index}
              item={item}
              productOptions={productOptions}
              disabled={saving}
              productEmptyState={
                <Text variant="bodyMedium" style={styles.mutedText}>
                  Create the missing product from the Products section, then return here.
                </Text>
              }
              onSelectProduct={(option) =>
                updateItem(item.id, {
                  productId: option.value,
                  productDescription: option.description || option.label,
                })
              }
              onChange={(patch) => updateItem(item.id, patch)}
              onRemove={() =>
                setItems((current) => (current.length > 1 ? current.filter((row) => row.id !== item.id) : current))
              }
            />
          ))}
        </View>

        <View style={styles.actionRow}>
          <Button
            mode="outlined"
            disabled={saving}
            onPress={() => setItems((current) => [...current, createLine(`stock-${current.length + 1}`)])}
          >
            Add item
          </Button>
          <Button mode="contained" loading={saving} disabled={saving} onPress={() => void handleCreate()}>
            Save stock
          </Button>
        </View>
      </SurfaceCard>

      <SurfaceCard contentStyle={styles.stack}>
        <Text variant="titleMedium">Stock Batches</Text>
        <SheetTable
          columns={[
            { key: "batch", label: "Batch", width: 90 },
            { key: "product", label: "Product", width: 160 },
            { key: "available", label: "Available", width: 90, align: "right" },
            { key: "seller", label: "Assigned", width: 130 },
          ]}
          rows={data?.batches ?? []}
          keyExtractor={(row) => row.id}
          emptyTitle="No stock"
          emptyDescription="No stock batches matched this search."
          renderCell={(row, column) => {
            switch (column.key) {
              case "batch":
                return (
                  <Text variant="bodySmall" style={styles.primaryCellText}>
                    {row.batchCode || row.id.slice(0, 6)}
                  </Text>
                );
              case "product":
                return (
                  <View style={styles.copy}>
                    <Text variant="bodyMedium" style={styles.primaryCellText}>
                      {row.productName || "Unknown"}
                    </Text>
                    <Text variant="bodySmall" style={styles.mutedText}>
                      {row.supplierName || "No supplier"}
                    </Text>
                  </View>
                );
              case "available":
                return (
                  <View style={styles.rightCluster}>
                    <Text variant="bodyMedium" style={styles.rightText}>
                      {row.currentWeightKg.toFixed(2)} kg
                    </Text>
                    {row.costPerKg != null ? (
                      <Text variant="bodySmall" style={styles.mutedText}>
                        {formatCurrency(row.costPerKg)}
                      </Text>
                    ) : null}
                  </View>
                );
              case "seller":
                return (
                  <View style={styles.copy}>
                    <Text variant="bodyMedium">{row.mfcSellerName || "Unassigned"}</Text>
                    <Text variant="bodySmall" style={styles.mutedText}>
                      {formatLongDate(row.updatedAt.slice(0, 10))}
                    </Text>
                  </View>
                );
              default:
                return null;
            }
          }}
        />
      </SurfaceCard>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  inlineRow: {
    flexDirection: "row",
    gap: 12,
  },
  inlineField: {
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  copy: {
    gap: 2,
  },
  primaryCellText: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  rightCluster: {
    alignItems: "flex-end",
    gap: 2,
  },
  rightText: {
    textAlign: "right",
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
});
