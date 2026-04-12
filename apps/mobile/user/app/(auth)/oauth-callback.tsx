import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text } from "react-native-paper";

import {
  completeOAuthRedirect,
  USER_MOBILE_OAUTH_CALLBACK_URL,
} from "@/lib/supabase";

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default function OAuthCallbackScreen() {
  const params = useLocalSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const callbackUrl = useMemo(() => {
    const query = new URLSearchParams();

    for (const [key, rawValue] of Object.entries(params)) {
      const value = firstParam(rawValue);
      if (value) {
        query.set(key, value);
      }
    }

    return query.size > 0
      ? `${USER_MOBILE_OAUTH_CALLBACK_URL}?${query.toString()}`
      : null;
  }, [params]);

  useEffect(() => {
    let cancelled = false;

    if (!callbackUrl) {
      return;
    }

    void (async () => {
      try {
        await completeOAuthRedirect(callbackUrl);
        if (cancelled) return;
        setStatus("success");
        setError(null);
      } catch (reason) {
        if (!cancelled) {
          setStatus("error");
          setError(reason instanceof Error ? reason.message : "Could not complete sign-in.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [callbackUrl]);

  return (
    <View style={styles.container}>
      {status === "loading" ? <ActivityIndicator size="large" /> : null}
      <Text variant="bodyMedium" style={styles.text}>
        {error ?? (status === "success" ? "Signed in. Opening the app..." : "Completing sign-in...")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 20,
  },
  text: {
    color: "#64748b",
    textAlign: "center",
  },
});
