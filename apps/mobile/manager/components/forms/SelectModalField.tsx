import { useMemo, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, List, Modal, Portal, Searchbar, Text } from "react-native-paper";

import type { SelectionOption } from "@/repositories/types";
import { PaperTextInput } from "@/components/ui/PaperTextInput";
import { appColors, appRadii, appSpacing, cardSurfaceStyle } from "@/lib/theme";

type Props = {
  label: string;
  placeholder: string;
  value?: string;
  options: SelectionOption[];
  disabled?: boolean;
  searchPlaceholder?: string;
  emptyState?: ReactNode;
  createAction?: {
    label: string;
    onPress: () => void;
  };
  onSelect: (option: SelectionOption) => void;
};

export function SelectModalField({
  label,
  placeholder,
  value,
  options,
  disabled = false,
  searchPlaceholder,
  emptyState,
  createAction,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search.trim()) {
      return options;
    }

    const query = search.trim().toLowerCase();
    return options.filter((option) => {
      return (
        option.label.toLowerCase().includes(query) ||
        option.description?.toLowerCase().includes(query) ||
        option.meta?.toLowerCase().includes(query)
      );
    });
  }, [options, search]);

  return (
    <>
      <Pressable disabled={disabled} onPress={() => setOpen(true)}>
        <View pointerEvents="none">
          <PaperTextInput
            mode="outlined"
            label={label}
            value={value ?? ""}
            placeholder={placeholder}
            editable={false}
            right={<PaperTextInput.Icon icon="chevron-down" />}
            disabled={disabled}
          />
        </View>
      </Pressable>

      <Portal>
        <Modal
          visible={open}
          onDismiss={() => {
            setOpen(false);
            setSearch("");
          }}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleMedium" style={styles.title}>
            {label}
          </Text>
          <Searchbar
            placeholder={searchPlaceholder ?? `Search ${label.toLowerCase()}...`}
            value={search}
            onChangeText={setSearch}
            style={styles.search}
          />
          <View style={styles.options}>
            {filteredOptions.map((option) => (
              <List.Item
                key={option.value}
                title={option.label}
                description={[option.description, option.meta].filter(Boolean).join(" • ")}
                onPress={() => {
                  onSelect(option);
                  setOpen(false);
                  setSearch("");
                }}
              />
            ))}
            {filteredOptions.length === 0 ? (
              emptyState ? (
                <View style={styles.emptyWrap}>
                  {emptyState}
                  {createAction ? (
                    <Button
                      mode="outlined"
                      onPress={() => {
                        createAction.onPress();
                        setOpen(false);
                      }}
                    >
                      {createAction.label}
                    </Button>
                  ) : null}
                </View>
              ) : (
                <View style={styles.emptyWrap}>
                  <Text variant="bodyMedium" style={styles.emptyLabel}>
                    No results found.
                  </Text>
                  {createAction ? (
                    <Button
                      mode="outlined"
                      onPress={() => {
                        createAction.onPress();
                        setOpen(false);
                      }}
                    >
                      {createAction.label}
                    </Button>
                  ) : null}
                </View>
              )
            ) : null}
          </View>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 16,
    maxHeight: "75%",
    ...cardSurfaceStyle,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    gap: appSpacing.sm,
  },
  title: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  search: {
    backgroundColor: appColors.secondarySurface,
    borderColor: appColors.border,
    borderWidth: 1,
  },
  options: {
    backgroundColor: appColors.surface,
  },
  emptyWrap: {
    gap: 12,
    paddingVertical: 24,
  },
  emptyLabel: {
    color: appColors.mutedForeground,
    textAlign: "center",
  },
});
