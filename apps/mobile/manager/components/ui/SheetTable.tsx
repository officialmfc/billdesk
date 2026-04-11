import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { appColors, appRadii } from "@/lib/theme";

export type SheetTableColumn<TColumnKey extends string = string> = {
  align?: "left" | "center" | "right";
  key: TColumnKey;
  label: string;
  width: number;
};

type Props<TRow, TColumnKey extends string = string> = {
  columns: ReadonlyArray<SheetTableColumn<TColumnKey>>;
  emptyDescription?: string;
  emptyTitle?: string;
  keyExtractor: (row: TRow, index: number) => string;
  renderCell: (row: TRow, column: SheetTableColumn<TColumnKey>, index: number) => ReactNode;
  rows: ReadonlyArray<TRow>;
};

function getAlignItems(align: SheetTableColumn["align"]) {
  if (align === "right") {
    return "flex-end" as const;
  }

  if (align === "center") {
    return "center" as const;
  }

  return "flex-start" as const;
}

export function SheetTable<TRow, TColumnKey extends string = string>({
  columns,
  emptyDescription,
  emptyTitle = "No rows",
  keyExtractor,
  renderCell,
  rows,
}: Props<TRow, TColumnKey>) {
  const minWidth = columns.reduce((sum, column) => sum + column.width, 0);

  return (
    <View style={styles.tableWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.table, { minWidth }]}>
          <View style={styles.headerRow}>
            {columns.map((column) => (
              <View
                key={column.key}
                style={[
                  styles.headerCell,
                  styles.cellDivider,
                  {
                    alignItems: getAlignItems(column.align),
                    width: column.width,
                  },
                ]}
              >
                <Text variant="labelSmall" style={styles.headerLabel}>
                  {column.label}
                </Text>
              </View>
            ))}
          </View>

          {rows.length ? (
            rows.map((row, index) => (
              <View
                key={keyExtractor(row, index)}
                style={[
                  styles.bodyRow,
                  index === rows.length - 1 ? styles.bodyRowLast : null,
                ]}
              >
                {columns.map((column) => (
                  <View
                    key={column.key}
                    style={[
                      styles.bodyCell,
                      styles.cellDivider,
                      {
                        alignItems: getAlignItems(column.align),
                        width: column.width,
                      },
                    ]}
                  >
                    {renderCell(row, column, index)}
                  </View>
                ))}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text variant="titleSmall" style={styles.emptyTitle}>
                {emptyTitle}
              </Text>
              {emptyDescription ? (
                <Text variant="bodySmall" style={styles.emptyDescription}>
                  {emptyDescription}
                </Text>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tableWrap: {
    borderColor: appColors.border,
    borderRadius: appRadii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  table: {
    backgroundColor: appColors.surface,
  },
  headerRow: {
    backgroundColor: appColors.secondarySurface,
    borderBottomColor: appColors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
  },
  headerCell: {
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  headerLabel: {
    color: appColors.mutedForeground,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  bodyRow: {
    borderBottomColor: appColors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
  },
  bodyRowLast: {
    borderBottomWidth: 0,
  },
  bodyCell: {
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  cellDivider: {
    borderRightColor: appColors.border,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  emptyState: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  emptyTitle: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  emptyDescription: {
    color: appColors.mutedForeground,
    textAlign: "center",
  },
});
