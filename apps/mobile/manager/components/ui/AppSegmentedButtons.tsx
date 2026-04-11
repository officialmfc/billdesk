import { StyleSheet } from "react-native";
import { SegmentedButtons } from "react-native-paper";

import { appColors, appRadii } from "@/lib/theme";

type ButtonConfig = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  buttons: ButtonConfig[];
};

export function AppSegmentedButtons({ value, onValueChange, buttons }: Props) {
  return (
    <SegmentedButtons
      value={value}
      onValueChange={onValueChange}
      style={styles.group}
      buttons={buttons.map((button) => ({
        ...button,
        checkedColor: appColors.primary,
        style: styles.button,
        labelStyle: styles.label,
      }))}
    />
  );
}

const styles = StyleSheet.create({
  group: {
    backgroundColor: appColors.secondarySurface,
    borderRadius: appRadii.md,
  },
  button: {
    borderColor: appColors.borderStrong,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});
