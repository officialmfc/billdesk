import { useEffect, useState, type ReactNode } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { appColors, appSpacing } from "@/lib/theme";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  scrollable?: boolean;
  rightAction?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  scrollRef?: any;
};

export function ScreenLayout({
  title,
  subtitle,
  children,
  scrollable = true,
  rightAction,
  showBack = false,
  onBack,
  scrollRef,
}: Props) {
  const insets = useSafeAreaInsets();
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardInset(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardInset(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const content = scrollable ? (
    <ScrollView
      ref={scrollRef}
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: 32 + insets.bottom + keyboardInset },
      ]}
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentInner}>{children}</View>
    </ScrollView>
  ) : (
    <View style={[styles.scrollContent, { paddingBottom: 16 + insets.bottom }]}>
      <View style={styles.contentInner}>{children}</View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Appbar.Header mode="small" style={styles.header}>
        {showBack ? <Appbar.BackAction onPress={onBack} /> : null}
        <Appbar.Content
          title={title}
          titleStyle={styles.title}
          subtitle={subtitle}
          subtitleStyle={styles.subtitle}
        />
        {rightAction}
      </Appbar.Header>
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  header: {
    backgroundColor: appColors.background,
    borderBottomColor: appColors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: appSpacing.md,
    paddingTop: appSpacing.sm,
  },
  contentInner: {
    alignSelf: "center",
    gap: appSpacing.md,
    maxWidth: 760,
    width: "100%",
  },
  title: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  subtitle: {
    color: appColors.mutedForeground,
  },
});
