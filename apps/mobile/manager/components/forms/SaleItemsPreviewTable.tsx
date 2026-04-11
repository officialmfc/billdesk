import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { appColors } from "@/lib/theme";

type Column = {
  key: string;
  label: string;
  flex?: number;
  align?: "left" | "right";
};

type Row = Record<string, string>;

type Props = {
  title?: string;
  description?: string;
  columns: Column[];
  rows: Row[];
};

export function SaleItemsPreviewTable({
  title = "Items Preview",
  description = "Live sale lines",
  columns,
  rows,
}: Props) {
  return (
    <SurfaceCard contentStyle={styles.content}>
      <SectionHeader title={title} description={description} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {columns.map((column) => (
              <Text
                key={column.key}
                variant="labelSmall"
                style={[
                  styles.headerCell,
                  {
                    flex: column.flex ?? 1,
                    textAlign: column.align === "right" ? "right" : "left",
                  },
                ]}
              >
                {column.label}
              </Text>
            ))}
          </View>

          {rows.map((row, rowIndex) => (
            <View
              key={`preview-row-${rowIndex}`}
              style={[styles.row, rowIndex === rows.length - 1 ? styles.rowLast : null]}
            >
              {columns.map((column, columnIndex) => (
                <Text
                  key={column.key}
                  variant="bodySmall"
                  numberOfLines={1}
                  style={[
                    styles.value,
                    {
                      flex: column.flex ?? 1,
                      textAlign: column.align === "right" ? "right" : "left",
                    },
                    columnIndex === columns.length - 1 ? styles.totalValue : null,
                  ]}
                >
                  {row[column.key] ?? "-"}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  table: {
    borderColor: appColors.border,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 560,
    overflow: "hidden",
  },
  headerRow: {
    backgroundColor: appColors.secondarySurface,
    borderBottomColor: appColors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerCell: {
    color: appColors.mutedForeground,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  row: {
    borderBottomColor: appColors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  value: {
    color: appColors.foreground,
  },
  totalValue: {
    color: appColors.primaryStrong,
    fontWeight: "700",
  },
});
