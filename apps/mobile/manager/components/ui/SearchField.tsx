import { Searchbar } from "react-native-paper";

import { appColors, appRadii } from "@/lib/theme";

type Props = {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
};

export function SearchField({ placeholder, value, onChangeText }: Props) {
  return (
    <Searchbar
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      elevation={0}
      inputStyle={{ color: appColors.foreground }}
      style={{
        backgroundColor: appColors.surface,
        borderColor: appColors.border,
        borderRadius: appRadii.md,
        borderWidth: 1,
      }}
    />
  );
}
