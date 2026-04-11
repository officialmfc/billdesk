import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import type { ReactNode } from "react";

import type { QuoteItemDraft, SelectionOption } from "@/repositories/types";
import { PaperTextInput } from "@/components/ui/PaperTextInput";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

import { SelectModalField } from "./SelectModalField";

type Props = {
  index: number;
  item: QuoteItemDraft;
  productOptions: SelectionOption[];
  disabled?: boolean;
  productEmptyState?: ReactNode;
  productCreateAction?: {
    label: string;
    onPress: () => void;
  };
  onSelectProduct: (option: SelectionOption) => void;
  onChange: (patch: Partial<QuoteItemDraft>) => void;
  onRemove: () => void;
};

export function QuoteItemEditor({
  index,
  item,
  productOptions,
  disabled = false,
  productEmptyState,
  productCreateAction,
  onSelectProduct,
  onChange,
  onRemove,
}: Props) {
  return (
    <SurfaceCard contentStyle={styles.stack}>
        <View style={styles.headerRow}>
          <Text variant="titleMedium">Item {index + 1}</Text>
          <Button compact onPress={onRemove} disabled={disabled}>
            Remove
          </Button>
        </View>

        <SelectModalField
          label="Product"
          placeholder="Select product"
          value={productOptions.find((option) => option.value === item.productId)?.label}
          options={productOptions}
          disabled={disabled}
          searchPlaceholder="Search product..."
          emptyState={productEmptyState}
          createAction={productCreateAction}
          onSelect={onSelectProduct}
        />

        <PaperTextInput
          mode="outlined"
          label="Description"
          value={item.productDescription ?? ""}
          onChangeText={(value: string) => onChange({ productDescription: value })}
          disabled={disabled}
        />

        <View style={styles.numericRow}>
          <PaperTextInput
            mode="outlined"
            label="Weight (kg)"
            keyboardType="decimal-pad"
            value={item.weightKg}
            onChangeText={(value: string) => onChange({ weightKg: value })}
            disabled={disabled}
            style={styles.numericInput}
          />
          <PaperTextInput
            mode="outlined"
            label="Price / kg"
            keyboardType="decimal-pad"
            value={item.pricePerKg}
            onChangeText={(value: string) => onChange({ pricePerKg: value })}
            disabled={disabled}
            style={styles.numericInput}
          />
        </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  numericRow: {
    flexDirection: "row",
    gap: 12,
  },
  numericInput: {
    flex: 1,
  },
});
