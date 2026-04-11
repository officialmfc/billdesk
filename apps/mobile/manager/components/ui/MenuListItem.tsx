import type { LucideIcon } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { appColors } from "@/lib/theme";

type Props = {
  title: string;
  description: string;
  icon: LucideIcon;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
};

export function MenuListItem({
  title,
  description,
  icon: Icon,
  onPress,
  disabled = false,
  destructive = false,
}: Props) {
  const iconColor = destructive
    ? appColors.danger
    : disabled
      ? appColors.mutedForeground
      : appColors.primary;

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.pressable}>
      <View style={[styles.iconWrap, destructive ? styles.iconDanger : null]}>
        <Icon size={18} color={iconColor} />
      </View>
      <View style={styles.copy}>
        <Text variant="titleSmall" style={[styles.title, destructive ? styles.titleDanger : null]}>
          {title}
        </Text>
        <Text variant="bodySmall" style={styles.description}>
          {description}
        </Text>
      </View>
      {!disabled ? <ChevronRight size={18} color={appColors.mutedForeground} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 68,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: appColors.primarySoft,
    borderRadius: 16,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  iconDanger: {
    backgroundColor: appColors.dangerSoft,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  titleDanger: {
    color: appColors.danger,
  },
  description: {
    color: appColors.mutedForeground,
  },
});
