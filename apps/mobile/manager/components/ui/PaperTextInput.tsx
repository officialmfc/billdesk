import { TextInput as PaperTextInputBase } from "react-native-paper";
import type { TextInputProps } from "react-native-paper";
import type { ComponentType } from "react";

type PaperTextInputComponent = typeof PaperTextInputBase & ComponentType<TextInputProps>;

export const PaperTextInput = PaperTextInputBase as PaperTextInputComponent;
