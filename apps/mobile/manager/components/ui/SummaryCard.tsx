import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { appColors, appRadii, appSpacing } from "@/lib/theme";

import { SurfaceCard } from "./SurfaceCard";

type Props = {
  title: string;
  value: string;
  note?: string;
  tone?: string;
  icon: LucideIcon;
};

export function SummaryCard({ title, value, note, tone, icon: Icon }: Props) {
  return (
    <SurfaceCard contentStyle={styles.content}>
        <View style={styles.copy}>
          <Text variant="labelMedium" style={styles.title}>
            {title}
          </Text>
          <Text variant="headlineSmall" style={[styles.value, tone ? { color: tone } : null]}>
            {value}
          </Text>
          {note ? (
            <Text variant="bodySmall" style={styles.note}>
              {note}
            </Text>
          ) : null}
        </View>
        <View style={styles.iconWrap}>
          <Icon size={18} color={appColors.primary} />
        </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: appSpacing.sm,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: appColors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  note: {
    color: appColors.mutedForeground,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: appRadii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appColors.primarySoft,
  },
});
