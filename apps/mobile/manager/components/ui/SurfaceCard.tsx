import type { ReactNode } from "react";
import type { LayoutChangeEvent, StyleProp, ViewStyle } from "react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { appColors, appRadii, appSpacing, cardSurfaceStyle } from "@/lib/theme";

type Props = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export function SurfaceCard({
  children,
  onPress,
  disabled = false,
  style,
  contentStyle,
  onLayout,
}: Props) {
  const card = (
    <View onLayout={onLayout} style={[styles.card, style, disabled ? styles.disabled : null]}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );

  if (!onPress) {
    return card;
  }

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => (pressed && !disabled ? styles.pressed : null)}
    >
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardSurfaceStyle,
  },
  content: {
    gap: appSpacing.sm,
    padding: appSpacing.md,
  },
  disabled: {
    opacity: 0.65,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
});
