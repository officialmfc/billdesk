import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { SearchField } from "@/components/ui/SearchField";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { appColors } from "@/lib/theme";
import type { LedgerSearchUser } from "@/repositories/types";

type Props = {
  title: string;
  description: string;
  placeholder: string;
  users: LedgerSearchUser[];
  emptyMessage: string;
  onSelect: (userId: string) => void;
};

export function LedgerSearchPanel({
  title,
  description,
  placeholder,
  users,
  emptyMessage,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return users.slice(0, 8);
    }

    return users.filter((user) =>
      [user.business_name, user.name, user.phone]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized))
    );
  }, [query, users]);

  return (
    <SurfaceCard contentStyle={styles.stack}>
      <View style={styles.copy}>
        <Text variant="titleMedium">{title}</Text>
        <Text variant="bodySmall" style={styles.mutedText}>
          {description}
        </Text>
      </View>

      <SearchField placeholder={placeholder} value={query} onChangeText={setQuery} />

      {filteredUsers.length ? (
        <View style={styles.results}>
          {filteredUsers.map((user) => {
            const label = user.business_name || user.name;
            return (
              <SurfaceCard
                key={user.id}
                contentStyle={styles.resultCard}
                onPress={() => onSelect(user.id)}
              >
                <View style={styles.copy}>
                  <Text variant="titleSmall">{label}</Text>
                  <Text variant="bodySmall" style={styles.mutedText}>
                    {user.business_name ? user.name : user.phone || "No phone"}
                  </Text>
                </View>
                <Button compact mode="text" onPress={() => onSelect(user.id)}>
                  View
                </Button>
              </SurfaceCard>
            );
          })}
        </View>
      ) : query.trim() ? (
        <Text variant="bodySmall" style={styles.mutedText}>
          {emptyMessage}
        </Text>
      ) : null}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  copy: {
    gap: 4,
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
  results: {
    gap: 8,
  },
  resultCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
});
