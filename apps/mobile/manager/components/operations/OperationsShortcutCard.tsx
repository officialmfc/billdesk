import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { appColors, appRadii, appSpacing } from "@/lib/theme";

type Props = {
  title: string;
  icon: LucideIcon;
  onPress: () => void;
};

export function OperationsShortcutCard({ title, icon: Icon, onPress }: Props) {
  return (
    <SurfaceCard onPress={onPress} contentStyle={styles.content}>
      <View style={styles.iconWrap}>
        <Icon size={18} color={appColors.primary} />
      </View>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: appSpacing.xs,
    minHeight: 92,
    justifyContent: "center",
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
});
