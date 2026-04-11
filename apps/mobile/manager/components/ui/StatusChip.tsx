import { Chip } from "react-native-paper";

import { appColors } from "@/lib/theme";

type Props = {
  label: string;
  tone?: "default" | "success" | "warning" | "danger";
};

const CHIP_COLORS: Record<NonNullable<Props["tone"]>, { backgroundColor: string; textColor: string }> = {
  default: {
    backgroundColor: appColors.secondarySurface,
    textColor: appColors.foreground,
  },
  success: {
    backgroundColor: appColors.successSoft,
    textColor: appColors.success,
  },
  warning: {
    backgroundColor: appColors.warningSoft,
    textColor: appColors.warning,
  },
  danger: {
    backgroundColor: appColors.dangerSoft,
    textColor: appColors.danger,
  },
};

export function StatusChip({ label, tone = "default" }: Props) {
  const colors = CHIP_COLORS[tone];

  return (
    <Chip
      compact
      style={{ backgroundColor: colors.backgroundColor }}
      textStyle={{ color: colors.textColor, fontWeight: "600" }}
    >
      {label}
    </Chip>
  );
}
