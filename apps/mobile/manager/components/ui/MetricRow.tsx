import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { appColors } from "@/lib/theme";

type Props = {
  label: string;
  value: string;
};

export function MetricRow({ label, value }: Props) {
  return (
    <View style={styles.row}>
      <Text variant="bodySmall" style={styles.label}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  label: {
    color: appColors.mutedForeground,
  },
  value: {
    color: appColors.foreground,
    fontWeight: "600",
  },
});
