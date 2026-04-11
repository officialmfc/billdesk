import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "react-native-paper";

import { PaperTextInput } from "@/components/ui/PaperTextInput";
import { appColors, appRadii, appSpacing, cardSurfaceStyle } from "@/lib/theme";
import type { SelectionOption } from "@/repositories/types";

type Props = {
  label?: string;
  placeholder: string;
  value?: string;
  options: SelectionOption[];
  disabled?: boolean;
  autoFocus?: boolean;
  inputRef?: any;
  dense?: boolean;
  style?: StyleProp<ViewStyle>;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  onSelect: (option: SelectionOption) => void;
  onClearSelection?: () => void;
  onSubmitEditing?: () => void;
  onFocus?: (target?: any) => void;
};

function matchesQuery(option: SelectionOption, query: string) {
  const search = query.trim().toLowerCase();

  if (!search) {
    return -1;
  }

  const label = option.label.toLowerCase();
  const description = option.description?.toLowerCase() ?? "";
  const meta = option.meta?.toLowerCase() ?? "";

  if (label === search) return 120;
  if (label.startsWith(search)) return 110;
  if (label.split(/\s+/).some((part) => part.startsWith(search))) return 100;
  if (description.startsWith(search)) return 90;
  if (meta.startsWith(search)) return 80;
  if (label.includes(search)) return 70;
  if (description.includes(search)) return 60;
  if (meta.includes(search)) return 50;

  return -1;
}

export function AutocompleteSelectField({
  label,
  placeholder,
  value,
  options,
  disabled = false,
  autoFocus = false,
  inputRef,
  dense = false,
  style,
  returnKeyType = "next",
  onSelect,
  onClearSelection,
  onSubmitEditing,
  onFocus,
}: Props) {
  const [query, setQuery] = useState(value ?? "");
  const [isDirty, setIsDirty] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<ScrollView | null>(null);

  const suggestions = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    return options
      .map((option) => ({
        option,
        score: matchesQuery(option, query),
      }))
      .filter((entry) => entry.score >= 0)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.option.label.localeCompare(b.option.label);
      })
      .slice(0, 8)
      .map((entry) => entry.option);
  }, [options, query]);

  useEffect(() => {
    if (!isDirty) {
      setQuery(value ?? "");
    }
  }, [isDirty, value]);

  useEffect(() => {
    setSelectedIndex(suggestions.length > 0 ? 0 : -1);
  }, [suggestions.length, query]);

  useEffect(() => {
    if (selectedIndex < 0) {
      return;
    }

    suggestionsRef.current?.scrollTo({
      y: Math.max(0, (selectedIndex - 2) * 68),
      animated: false,
    });
  }, [selectedIndex]);

  const selectSuggestion = (option: SelectionOption) => {
    onSelect(option);
    setQuery(option.label);
    setIsDirty(false);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    if (onSubmitEditing) {
      setTimeout(() => onSubmitEditing(), 0);
    }
  };

  const handleSubmit = () => {
    const hasPendingSearch = isDirty || !value || query !== value;

    if (hasPendingSearch && suggestions.length > 0) {
      selectSuggestion(suggestions[selectedIndex] ?? suggestions[0]);
      return;
    }

    onSubmitEditing?.();
  };

  const mergedInputRef = (node: any) => {
    if (!inputRef) {
      return;
    }

    if (typeof inputRef === "function") {
      inputRef(node);
    } else {
      inputRef.current = node;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <PaperTextInput
        ref={mergedInputRef}
        mode="outlined"
        label={label}
        placeholder={placeholder}
        value={query}
        onChangeText={(text: string) => {
          setQuery(text);
          setIsDirty(true);
          setShowSuggestions(true);

          if (text !== (value ?? "")) {
            onClearSelection?.();
          }
        }}
        onFocus={(event) => {
          setShowSuggestions(true);
          onFocus?.(event.nativeEvent.target);
        }}
        onBlur={() => {
          setTimeout(() => {
            setShowSuggestions(false);
            if (!isDirty) {
              setQuery(value ?? "");
            }
          }, 120);
        }}
        onKeyPress={(event) => {
          if (event.nativeEvent.key === "ArrowDown") {
            setSelectedIndex((current) =>
              current < suggestions.length - 1 ? current + 1 : current
            );
          } else if (event.nativeEvent.key === "ArrowUp") {
            setSelectedIndex((current) => (current > 0 ? current - 1 : current));
          }
        }}
        onSubmitEditing={handleSubmit}
        returnKeyType={returnKeyType}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        blurOnSubmit={false}
        dense={dense}
        disabled={disabled}
        right={
          query ? (
            <PaperTextInput.Icon
              icon="close"
              onPress={() => {
                setQuery("");
                setIsDirty(false);
                setShowSuggestions(false);
                setSelectedIndex(-1);
                onClearSelection?.();
              }}
            />
          ) : undefined
        }
      />

      {showSuggestions && suggestions.length > 0 ? (
        <View style={styles.suggestions}>
          <ScrollView
            ref={suggestionsRef}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {suggestions.map((option, index) => (
              <Pressable
                key={option.value}
                onPress={() => selectSuggestion(option)}
                style={[
                  styles.option,
                  index === selectedIndex ? styles.optionActive : null,
                ]}
              >
                <Text variant="bodyMedium" style={styles.optionLabel}>
                  {option.label}
                </Text>
                {option.description || option.meta ? (
                  <Text variant="bodySmall" style={styles.optionMeta}>
                    {[option.description, option.meta].filter(Boolean).join(" • ")}
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 10,
  },
  suggestions: {
    ...cardSurfaceStyle,
    borderRadius: appRadii.md,
    elevation: 16,
    left: 0,
    marginTop: 4,
    maxHeight: 260,
    position: "absolute",
    right: 0,
    top: "100%",
    zIndex: 50,
  },
  option: {
    borderBottomColor: appColors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
    paddingHorizontal: appSpacing.md,
    paddingVertical: 12,
  },
  optionActive: {
    backgroundColor: appColors.primarySoft,
  },
  optionLabel: {
    color: appColors.foreground,
    fontWeight: "600",
  },
  optionMeta: {
    color: appColors.mutedForeground,
  },
});
