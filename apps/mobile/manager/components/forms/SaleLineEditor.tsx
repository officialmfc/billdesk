import { useMemo, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { CirclePlus, Trash2 } from "lucide-react-native";
import { Button, Text } from "react-native-paper";

import type { SelectionOption, SaleFormLookups, SaleLineDraft } from "@/repositories/types";
import { PaperTextInput } from "@/components/ui/PaperTextInput";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { appColors } from "@/lib/theme";

import { AutocompleteSelectField } from "./AutocompleteSelectField";

type BatchOption = SaleFormLookups["stockBatches"][number];
type FocusField =
  | "seller"
  | "buyer"
  | "batch"
  | "product"
  | "description"
  | "weight"
  | "rate";
type LayoutMode = "auction" | "direct" | "batch" | "floor";

function normalizeDecimalInput(value: string) {
  const normalized = value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  const [whole, ...rest] = normalized.split(".");

  if (rest.length === 0) {
    return whole;
  }

  return `${whole}.${rest.join("")}`;
}

type Props = {
  index: number;
  line: SaleLineDraft;
  disabled?: boolean;
  buyerLabel?: string;
  sellerLabel?: string;
  showBuyer?: boolean;
  showSeller?: boolean;
  showBatch?: boolean;
  showProductSelect?: boolean;
  showProductDescription?: boolean;
  buyerOptions?: SelectionOption[];
  sellerOptions?: SelectionOption[];
  batchOptions?: BatchOption[];
  productOptions?: SelectionOption[];
  onSelectBuyer?: (option: SelectionOption) => void;
  onSelectSeller?: (option: SelectionOption) => void;
  onSelectBatch?: (option: BatchOption) => void;
  onSelectProduct?: (option: SelectionOption) => void;
  onChange: (patch: Partial<SaleLineDraft>) => void;
  onRemove: () => void;
  firstFieldRef?: any;
  autoFocusFirstField?: boolean;
  onSubmitRate?: () => void;
  onAddLine?: () => void;
  layoutMode?: LayoutMode;
  onFocusField?: (target: any) => void;
  onFocusLine?: (lineId: string) => void;
  onLineLayout?: (lineId: string, y: number) => void;
};

export function SaleLineEditor({
  index,
  line,
  disabled = false,
  buyerLabel = "Buyer",
  sellerLabel = "Seller",
  showBuyer = true,
  showSeller = false,
  showBatch = false,
  showProductSelect = false,
  showProductDescription = true,
  buyerOptions = [],
  sellerOptions = [],
  batchOptions = [],
  productOptions = [],
  onSelectBuyer,
  onSelectSeller,
  onSelectBatch,
  onSelectProduct,
  onChange,
  onRemove,
  firstFieldRef,
  autoFocusFirstField = false,
  onSubmitRate,
  onAddLine,
  layoutMode = "auction",
  onFocusField,
  onFocusLine,
  onLineLayout,
}: Props) {
  const sellerRef = useRef<any>(null);
  const buyerRef = useRef<any>(null);
  const batchRef = useRef<any>(null);
  const productRef = useRef<any>(null);
  const descriptionRef = useRef<any>(null);
  const weightRef = useRef<any>(null);
  const rateRef = useRef<any>(null);

  const fieldOrder = useMemo(() => {
    switch (layoutMode) {
      case "auction":
        return ["buyer", "description", "weight", "rate"] as FocusField[];
      case "batch":
        return ["buyer", "batch", "weight", "rate"] as FocusField[];
      case "direct":
        return ["seller", "batch", "weight", "rate"] as FocusField[];
      case "floor":
        return ["buyer", "seller", "batch", "weight", "rate"] as FocusField[];
      default: {
        const order: FocusField[] = [];

        if (showSeller) order.push("seller");
        if (showBuyer) order.push("buyer");
        if (showBatch) order.push("batch");
        if (showProductSelect) order.push("product");
        if (showProductDescription) order.push("description");
        order.push("weight", "rate");

        return order;
      }
    }
  }, [layoutMode, showBatch, showBuyer, showProductDescription, showProductSelect, showSeller]);

  const refs: Record<FocusField, any> = {
    seller: sellerRef,
    buyer: buyerRef,
    batch: batchRef,
    product: productRef,
    description: descriptionRef,
    weight: weightRef,
    rate: rateRef,
  };

  const firstField = fieldOrder[0];
  const lineAmount = (Number(line.weight || 0) * Number(line.rate || 0)).toFixed(2);

  const assignRef = (localRef: any, externalRef?: any) => (node: any) => {
    localRef.current = node;

    if (!externalRef) {
      return;
    }

    if (typeof externalRef === "function") {
      externalRef(node);
    } else {
      externalRef.current = node;
    }
  };

  const focusNext = (currentField: FocusField) => {
    const currentIndex = fieldOrder.indexOf(currentField);
    const nextField = fieldOrder[currentIndex + 1];

    if (nextField) {
      refs[nextField].current?.focus?.();
    }
  };

  const handleFocus = (target: any) => {
    onFocusLine?.(line.id);
    onFocusField?.(target);
  };

  const fieldNodes: Partial<Record<FocusField, React.ReactNode>> = {
    seller: showSeller ? (
      <AutocompleteSelectField
        label={undefined}
        placeholder={`${sellerLabel}...`}
        value={sellerOptions.find((option) => option.value === line.sellerId)?.label}
        options={sellerOptions}
        disabled={disabled}
        dense
        autoFocus={autoFocusFirstField && firstField === "seller"}
        inputRef={assignRef(sellerRef, firstField === "seller" ? firstFieldRef : undefined)}
        onFocus={handleFocus}
        onClearSelection={() => onChange({ sellerId: undefined })}
        onSubmitEditing={() => focusNext("seller")}
        onSelect={(option) => onSelectSeller?.(option)}
      />
    ) : null,
    buyer: showBuyer ? (
      <AutocompleteSelectField
        label={undefined}
        placeholder={`${buyerLabel}...`}
        value={buyerOptions.find((option) => option.value === line.buyerId)?.label}
        options={buyerOptions}
        disabled={disabled}
        dense
        autoFocus={autoFocusFirstField && firstField === "buyer"}
        inputRef={assignRef(buyerRef, firstField === "buyer" ? firstFieldRef : undefined)}
        onFocus={handleFocus}
        onClearSelection={() => onChange({ buyerId: undefined })}
        onSubmitEditing={() => focusNext("buyer")}
        onSelect={(option) => onSelectBuyer?.(option)}
      />
    ) : null,
    batch: showBatch ? (
      <AutocompleteSelectField
        label={undefined}
        placeholder="Stock batch..."
        value={batchOptions.find((option) => option.value === line.batchId)?.label}
        options={batchOptions}
        disabled={disabled}
        dense
        autoFocus={autoFocusFirstField && firstField === "batch"}
        inputRef={assignRef(batchRef, firstField === "batch" ? firstFieldRef : undefined)}
        onFocus={handleFocus}
        onClearSelection={() =>
          onChange({
            batchId: undefined,
            productId: undefined,
          })
        }
        onSubmitEditing={() => focusNext("batch")}
        onSelect={(option) => onSelectBatch?.(option as BatchOption)}
      />
    ) : null,
    product: showProductSelect ? (
      <AutocompleteSelectField
        label={undefined}
        placeholder="Product..."
        value={productOptions.find((option) => option.value === line.productId)?.label}
        options={productOptions}
        disabled={disabled}
        dense
        autoFocus={autoFocusFirstField && firstField === "product"}
        inputRef={assignRef(productRef, firstField === "product" ? firstFieldRef : undefined)}
        onFocus={handleFocus}
        onClearSelection={() => onChange({ productId: undefined })}
        onSubmitEditing={() => focusNext("product")}
        onSelect={(option) => onSelectProduct?.(option)}
      />
    ) : null,
    description: showProductDescription ? (
      <PaperTextInput
        ref={assignRef(descriptionRef, firstField === "description" ? firstFieldRef : undefined)}
        mode="outlined"
        label={undefined}
        placeholder="Product..."
        value={line.productDescription ?? ""}
        onChangeText={(value: string) => onChange({ productDescription: value })}
        onFocus={(event) => handleFocus(event.nativeEvent.target)}
        onSubmitEditing={() => focusNext("description")}
        returnKeyType="next"
        blurOnSubmit={false}
        autoFocus={autoFocusFirstField && firstField === "description"}
        disabled={disabled}
        dense
      />
    ) : null,
  };

  const fieldRows = useMemo(() => {
    switch (layoutMode) {
      case "auction":
        return [
          [
            { key: "buyer" as FocusField, flex: 2 },
            { key: "description" as FocusField, flex: 1 },
          ],
        ];
      case "batch":
        return [
          [
            { key: "buyer" as FocusField, flex: 2 },
            { key: "batch" as FocusField, flex: 1 },
          ],
        ];
      case "direct":
        return [
          [
            { key: "seller" as FocusField, flex: 2 },
            { key: "batch" as FocusField, flex: 1 },
          ],
        ];
      case "floor":
        return [
          [{ key: "buyer" as FocusField, flex: 1 }],
          [
            { key: "seller" as FocusField, flex: 2 },
            { key: "batch" as FocusField, flex: 1 },
          ],
        ];
      default:
        return [];
    }
  }, [layoutMode]);

  return (
    <SurfaceCard
      style={[styles.card, { zIndex: 1000 - index }]}
      contentStyle={styles.stack}
      onLayout={(event) => onLineLayout?.(line.id, event.nativeEvent.layout.y)}
    >
      <View style={styles.headerRow}>
        <Text variant="titleMedium">Line {index + 1}</Text>
        <Button
          compact
          mode="text"
          onPress={onRemove}
          disabled={disabled}
          textColor={appColors.primary}
          icon={() => <Trash2 size={14} color={appColors.primary} />}
          labelStyle={styles.removeText}
          contentStyle={styles.removeButtonContent}
        >
          Remove
        </Button>
      </View>

      {fieldRows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.topFieldRow}>
          {row.map((field) => {
            const node = fieldNodes[field.key];
            if (!node) {
              return null;
            }

            return (
              <View
                key={field.key}
                style={[styles.topFieldCell, { flex: field.flex }]}
              >
                {node}
              </View>
            );
          })}
        </View>
      ))}

      <View style={styles.numericRow}>
        <Pressable
          style={({ pressed }) => [styles.addRail, pressed ? styles.addRailPressed : null]}
          onPress={onAddLine}
          disabled={disabled || !onAddLine}
        >
          <CirclePlus
            size={16}
            color={disabled || !onAddLine ? appColors.borderStrong : appColors.mutedForeground}
          />
        </Pressable>
        <PaperTextInput
          ref={assignRef(weightRef, firstField === "weight" ? firstFieldRef : undefined)}
          mode="outlined"
          label={undefined}
          placeholder="Qty"
          keyboardType="default"
          value={line.weight}
          onChangeText={(value: string) => onChange({ weight: normalizeDecimalInput(value) })}
          onFocus={(event) => handleFocus(event.nativeEvent.target)}
          onSubmitEditing={() => focusNext("weight")}
          returnKeyLabel="Next"
          returnKeyType="next"
          blurOnSubmit={false}
          autoFocus={autoFocusFirstField && firstField === "weight"}
          disabled={disabled}
          dense
          style={styles.numericInput}
        />
        <Text variant="titleMedium" style={styles.operator}>
          ×
        </Text>
        <PaperTextInput
          ref={assignRef(rateRef, firstField === "rate" ? firstFieldRef : undefined)}
          mode="outlined"
          label={undefined}
          placeholder="Rate"
          keyboardType="default"
          value={line.rate}
          onChangeText={(value: string) => onChange({ rate: normalizeDecimalInput(value) })}
          onFocus={(event) => handleFocus(event.nativeEvent.target)}
          onSubmitEditing={onSubmitRate}
          returnKeyLabel="Done"
          returnKeyType="done"
          autoFocus={autoFocusFirstField && firstField === "rate"}
          disabled={disabled}
          dense
          style={styles.numericInput}
        />
        <Text variant="titleMedium" style={styles.operator}>
          =
        </Text>
        <View style={styles.amountWrap}>
          <Text variant="titleMedium" style={styles.amountText}>
            ₹{lineAmount}
          </Text>
        </View>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    elevation: 2,
    position: "relative",
  },
  stack: {
    gap: 10,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  topFieldRow: {
    flexDirection: "row",
    gap: 8,
  },
  topFieldCell: {
    minWidth: 0,
  },
  numericRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  addRail: {
    alignItems: "center",
    borderRadius: 999,
    justifyContent: "center",
    width: 20,
  },
  addRailPressed: {
    opacity: 0.72,
  },
  numericInput: {
    flex: 1,
  },
  operator: {
    color: appColors.mutedForeground,
    fontWeight: "700",
  },
  amountWrap: {
    minWidth: 78,
  },
  amountText: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  removeText: {
    color: appColors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  removeButtonContent: {
    flexDirection: "row-reverse",
    gap: 4,
  },
});
