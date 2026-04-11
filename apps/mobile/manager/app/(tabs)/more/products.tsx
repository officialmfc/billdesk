import { useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Switch, Text } from "react-native-paper";

import { SearchField } from "@/components/ui/SearchField";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SheetTable } from "@/components/ui/SheetTable";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { PaperTextInput } from "@/components/ui/PaperTextInput";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { useSync } from "@/contexts/SyncContext";
import { ErrorHandler } from "@/lib/error-handler";
import { formatLongDate } from "@/lib/formatters";
import { supabase } from "@/lib/supabase";
import { appColors } from "@/lib/theme";
import { adminRepository } from "@/repositories/adminRepository";

function createDraft() {
  return {
    description: "",
    name: "",
  };
}

export default function ProductsScreen() {
  const router = useRouter();
  const { performFullSync } = useSync();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState(createDraft);
  const [isTracked, setIsTracked] = useState(true);
  const [saving, setSaving] = useState(false);
  const { data, reload } = useRepositoryData(() => adminRepository.getProducts(search), [search]);

  const handleCreate = async () => {
    if (draft.name.trim().length < 2) {
      ErrorHandler.showWarning("Product name must be at least 2 characters.");
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.from("products").insert({
        description: draft.description.trim() || null,
        is_stock_tracked: isTracked,
        name: draft.name.trim(),
      });

      if (error) {
        throw error;
      }

      await performFullSync();
      await reload();
      setDraft(createDraft());
      setIsTracked(true);
      ErrorHandler.showSuccess("Product created.");
    } catch (error) {
      ErrorHandler.handle(error, "Create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout title="Products" subtitle="Catalog items used by sales, quotes, and stock" showBack onBack={() => router.back()}>
      <SearchField placeholder="Search products..." value={search} onChangeText={setSearch} />

      <SurfaceCard contentStyle={styles.stack}>
        <Text variant="titleMedium">Create Product</Text>
        <PaperTextInput
          mode="outlined"
          label="Product name"
          value={draft.name}
          onChangeText={(value) => setDraft((current) => ({ ...current, name: value }))}
        />
        <PaperTextInput
          mode="outlined"
          label="Description"
          value={draft.description}
          onChangeText={(value) => setDraft((current) => ({ ...current, description: value }))}
        />
        <View style={styles.switchRow}>
          <Text variant="bodyMedium">Track stock for this product</Text>
          <Switch value={isTracked} onValueChange={setIsTracked} />
        </View>
        <Button mode="contained" loading={saving} disabled={saving} onPress={() => void handleCreate()}>
          Save product
        </Button>
      </SurfaceCard>

      <SurfaceCard contentStyle={styles.stack}>
        <Text variant="titleMedium">Catalog</Text>
        <SheetTable
          columns={[
            { key: "name", label: "Name", width: 190 },
            { key: "tracked", label: "Tracked", width: 90, align: "center" },
            { key: "updated", label: "Updated", width: 120, align: "right" },
          ]}
          rows={data ?? []}
          keyExtractor={(row) => row.id}
          emptyTitle="No products"
          emptyDescription="No products matched this search."
          renderCell={(row, column) => {
            switch (column.key) {
              case "name":
                return (
                  <View style={styles.copy}>
                    <Text variant="bodyMedium" style={styles.primaryCellText}>
                      {row.name}
                    </Text>
                    <Text variant="bodySmall" style={styles.mutedText}>
                      {row.description || "No description"}
                    </Text>
                  </View>
                );
              case "tracked":
                return (
                  <Text variant="bodySmall" style={styles.centerText}>
                    {row.isStockTracked ? "Yes" : "No"}
                  </Text>
                );
              case "updated":
                return (
                  <Text variant="bodySmall" style={styles.rightText}>
                    {formatLongDate(row.updatedAt.slice(0, 10))}
                  </Text>
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
  switchRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  copy: {
    gap: 2,
  },
  primaryCellText: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  centerText: {
    textAlign: "center",
  },
  rightText: {
    textAlign: "right",
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
});
