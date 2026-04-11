import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { appColors, appRadii } from "@/lib/theme";

type Props = {
  dateLabel: string;
};

export function SaleHeaderDateBadge({ dateLabel }: Props) {
  return (
    <View style={styles.badge}>
      <Text variant="labelMedium" style={styles.text}>
        {dateLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: appColors.secondarySurface,
    borderColor: appColors.border,
    borderRadius: appRadii.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: 12,
  },
  text: {
    color: appColors.foreground,
    fontWeight: "700",
  },
});
