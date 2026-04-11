import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { appColors, appRadii, appSpacing, cardSurfaceStyle } from "@/lib/theme";

type Props = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function EmptyState({ title, description, icon: Icon }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Icon size={22} color={appColors.mutedForeground} />
        </View>
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardSurfaceStyle,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: appColors.borderStrong,
  },
  content: {
    alignItems: "center",
    gap: appSpacing.xs,
    paddingHorizontal: appSpacing.md,
    paddingVertical: appSpacing.xxl,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: appRadii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appColors.secondarySurface,
  },
  title: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  description: {
    textAlign: "center",
    color: appColors.mutedForeground,
  },
});
