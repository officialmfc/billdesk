import { MD3LightTheme } from "react-native-paper";

export const appColors = {
  background: "#ffffff",
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  secondarySurface: "#f1f5f9",
  foreground: "#0f172a",
  mutedForeground: "#64748b",
  primary: "#2563eb",
  primaryStrong: "#1d4ed8",
  primarySoft: "#dbeafe",
  primarySoftText: "#1e3a8a",
  border: "#dbe4ee",
  borderStrong: "#cbd5e1",
  success: "#15803d",
  successSoft: "#dcfce7",
  warning: "#b45309",
  warningSoft: "#fef3c7",
  danger: "#dc2626",
  dangerSoft: "#fee2e2",
} as const;

export const appRadii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const appSpacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const cardSurfaceStyle = {
  backgroundColor: appColors.surface,
  borderColor: appColors.border,
  borderWidth: 1,
  borderRadius: appRadii.lg,
  shadowColor: appColors.foreground,
  shadowOpacity: 0.04,
  shadowOffset: { width: 0, height: 6 },
  shadowRadius: 16,
  elevation: 1,
} as const;

export const appTheme = {
  ...MD3LightTheme,
  roundness: appRadii.md,
  colors: {
    ...MD3LightTheme.colors,
    primary: appColors.primary,
    onPrimary: "#ffffff",
    primaryContainer: appColors.primarySoft,
    onPrimaryContainer: appColors.primarySoftText,
    secondary: appColors.primaryStrong,
    onSecondary: "#ffffff",
    secondaryContainer: appColors.secondarySurface,
    onSecondaryContainer: appColors.foreground,
    background: appColors.background,
    onBackground: appColors.foreground,
    surface: appColors.surface,
    onSurface: appColors.foreground,
    surfaceVariant: appColors.secondarySurface,
    onSurfaceVariant: appColors.mutedForeground,
    outline: appColors.borderStrong,
    outlineVariant: appColors.border,
    error: appColors.danger,
    onError: "#ffffff",
    errorContainer: appColors.dangerSoft,
    onErrorContainer: "#991b1b",
  },
};
