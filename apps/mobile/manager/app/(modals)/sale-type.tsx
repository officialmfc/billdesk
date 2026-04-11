import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SaleFlowActionList } from "@/components/sales/SaleFlowActionList";
import { OfflineReadOnlyBanner } from "@/components/ui/OfflineReadOnlyBanner";
import { useConnectivity } from "@/hooks/useConnectivity";
import { appColors, appRadii, appSpacing } from "@/lib/theme";

export default function SaleTypeModal() {
  const router = useRouter();
  const { isOnline } = useConnectivity();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, appSpacing.md) }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text variant="titleLarge">New Sale</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Choose the sales workflow
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <OfflineReadOnlyBanner visible={!isOnline} />
          <SaleFlowActionList
            isOnline={isOnline}
            onSelectFlow={(href) => router.replace(href as never)}
          />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },
  sheet: {
    maxHeight: "84%",
    borderTopLeftRadius: appRadii.xl,
    borderTopRightRadius: appRadii.xl,
    backgroundColor: appColors.background,
    borderColor: appColors.border,
    borderWidth: 1,
    paddingHorizontal: appSpacing.md,
    paddingTop: appSpacing.sm,
    gap: appSpacing.sm,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: appRadii.pill,
    backgroundColor: appColors.borderStrong,
  },
  header: {
    gap: 4,
    paddingBottom: 4,
  },
  subtitle: {
    color: appColors.mutedForeground,
  },
  scrollContent: {
    gap: appSpacing.sm,
    paddingBottom: appSpacing.sm,
  },
});
