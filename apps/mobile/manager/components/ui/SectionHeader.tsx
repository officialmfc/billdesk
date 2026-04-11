import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { appColors } from "@/lib/theme";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeader({ title, description, action }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
        {description ? (
          <Text variant="bodySmall" style={styles.description}>
            {description}
          </Text>
        ) : null}
      </View>
      {action ? <View>{action}</View> : null}
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
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  description: {
    color: appColors.mutedForeground,
  },
});
