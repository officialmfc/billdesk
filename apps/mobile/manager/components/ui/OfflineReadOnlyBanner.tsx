import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { WifiOff } from "lucide-react-native";

import { appColors, appRadii } from "@/lib/theme";

type Props = {
  visible: boolean;
  label?: string;
};

export function OfflineReadOnlyBanner({
  visible,
  label = "Offline mode: local data is available, but create and update actions are disabled.",
}: Props) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <WifiOff size={16} color={appColors.warning} />
      <Text variant="bodySmall" style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderColor: appColors.warning,
    borderRadius: appRadii.md,
    borderWidth: 1,
    backgroundColor: appColors.warningSoft,
  },
  label: {
    flex: 1,
    color: appColors.warning,
  },
});
