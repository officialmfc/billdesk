import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { appColors, appRadii, appSpacing } from "@/lib/theme";

import { SurfaceCard } from "./SurfaceCard";

type Props = {
  title: string;
  description: string;
  meta?: string;
  icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
};

export function ActionCard({
  title,
  description,
  meta,
  icon: Icon,
  onPress,
  disabled = false,
}: Props) {
  return (
    <SurfaceCard disabled={disabled} onPress={onPress} contentStyle={styles.content}>
      <View style={styles.iconWrap}>
        <Icon size={18} color={appColors.primary} />
      </View>
      <Text variant="titleMedium" style={[styles.title, disabled ? styles.textDisabled : null]}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={[styles.description, disabled ? styles.textDisabled : null]}>
        {description}
      </Text>
      {meta ? (
        <Text
          variant="labelMedium"
          style={[styles.meta, disabled ? styles.textDisabled : styles.metaActive]}
        >
          {meta}
        </Text>
      ) : null}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: appSpacing.xs,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: appRadii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appColors.primarySoft,
  },
  title: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  description: {
    color: appColors.mutedForeground,
  },
  meta: {
    fontWeight: "600",
  },
  metaActive: {
    color: appColors.primary,
  },
  textDisabled: {
    color: appColors.mutedForeground,
  },
});
