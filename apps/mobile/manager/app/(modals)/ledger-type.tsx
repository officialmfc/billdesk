import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LedgerFlowActionList } from "@/components/ledgers/LedgerFlowActionList";
import { appColors, appRadii, appSpacing } from "@/lib/theme";

export default function LedgerTypeModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, appSpacing.md) }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text variant="titleLarge">Ledgers</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Choose the ledger workflow
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LedgerFlowActionList onSelectFlow={(href) => router.replace(href as never)} />
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
