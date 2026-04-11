import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Switch, Text, TextInput } from "react-native-paper";

import type {
  MobileLocalSecurityMode,
  MobileLocalSecuritySnapshot,
  MobileLocalSecurityTimeoutSeconds,
  MobileLocalSecurityVerifyResult,
} from "@/lib/local-security";

type SetupProps = {
  loading?: boolean;
  onSubmit: (params: {
    biometricEnabled: boolean;
    mode: MobileLocalSecurityMode;
    secret: string;
    timeoutSeconds: MobileLocalSecurityTimeoutSeconds;
  }) => Promise<void> | void;
  snapshot: MobileLocalSecuritySnapshot;
};

type LockProps = {
  loading?: boolean;
  onUnlock: (secret: string) => Promise<MobileLocalSecurityVerifyResult>;
  onUnlockBiometric?: () => Promise<boolean> | boolean;
  snapshot: MobileLocalSecuritySnapshot;
};

const timeoutOptions: MobileLocalSecurityTimeoutSeconds[] = [30, 15, 5];

function SecurityModeToggle({
  mode,
  onChange,
}: {
  mode: MobileLocalSecurityMode;
  onChange: (mode: MobileLocalSecurityMode) => void;
}) {
  return (
    <View style={styles.modeRow}>
      {(["pin", "password"] as const).map((option) => {
        const active = mode === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.modeButton, active ? styles.modeButtonActive : null]}
          >
            <Text style={active ? styles.modeButtonTextActive : styles.modeButtonText}>
              {option === "pin" ? "PIN" : "Password"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TimeoutSelector({
  disabled = false,
  onChange,
  value,
}: {
  disabled?: boolean;
  onChange: (timeoutSeconds: MobileLocalSecurityTimeoutSeconds) => void;
  value: MobileLocalSecurityTimeoutSeconds;
}) {
  return (
    <View style={styles.timeoutRow}>
      {timeoutOptions.map((option) => {
        const active = option === value;
        return (
          <Button
            key={option}
            compact
            disabled={disabled}
            mode={active ? "contained" : "outlined"}
            onPress={() => onChange(option)}
          >
            {option}s
          </Button>
        );
      })}
    </View>
  );
}

export function LocalSecuritySetupScreen({ loading = false, onSubmit, snapshot }: SetupProps) {
  const [mode, setMode] = useState<MobileLocalSecurityMode>(snapshot.mode ?? "pin");
  const [timeoutSeconds, setTimeoutSeconds] = useState<MobileLocalSecurityTimeoutSeconds>(
    snapshot.timeoutSeconds
  );
  const [secret, setSecret] = useState("");
  const [confirmSecret, setConfirmSecret] = useState("");
  const [biometricEnabled, setBiometricEnabled] = useState(snapshot.biometricAvailable);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(snapshot.mode ?? "pin");
    setTimeoutSeconds(snapshot.timeoutSeconds);
    setBiometricEnabled(snapshot.biometricAvailable);
  }, [snapshot.biometricAvailable, snapshot.mode, snapshot.timeoutSeconds]);

  const helperText = useMemo(
    () =>
      mode === "pin"
        ? "Use a 4 to 8 digit PIN for quick device unlock."
        : "Use a private local password for this device.",
    [mode]
  );

  const handleSubmit = async () => {
    const normalizedSecret = secret.trim();
    if (mode === "pin" && !/^\d{4,8}$/.test(normalizedSecret)) {
      setError("PIN must be 4 to 8 digits.");
      return;
    }
    if (mode === "password" && normalizedSecret.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (normalizedSecret !== confirmSecret.trim()) {
      setError("PIN / password confirmation does not match.");
      return;
    }

    setError(null);
    await onSubmit({
      biometricEnabled: snapshot.biometricAvailable && biometricEnabled,
      mode,
      secret: normalizedSecret,
      timeoutSeconds,
    });
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text variant="headlineSmall" style={styles.title}>
          Set local unlock
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Protect MFC Admin on this device with a PIN or password.
        </Text>

        <SecurityModeToggle mode={mode} onChange={setMode} />

        <TextInput
          mode="outlined"
          keyboardType={mode === "pin" ? "number-pad" : "default"}
          label={mode === "pin" ? "PIN" : "Password"}
          secureTextEntry
          value={secret}
          onChangeText={setSecret}
        />
        <TextInput
          mode="outlined"
          keyboardType={mode === "pin" ? "number-pad" : "default"}
          label={`Confirm ${mode === "pin" ? "PIN" : "Password"}`}
          secureTextEntry
          value={confirmSecret}
          onChangeText={setConfirmSecret}
        />

        <Text variant="bodySmall" style={styles.mutedText}>
          {helperText}
        </Text>

        <View style={styles.settingCard}>
          <Text variant="titleSmall">Lock after</Text>
          <TimeoutSelector disabled={loading} onChange={setTimeoutSeconds} value={timeoutSeconds} />
        </View>

        {snapshot.biometricAvailable ? (
          <View style={styles.settingRow}>
            <View style={styles.copy}>
              <Text variant="titleSmall">Fast biometric unlock</Text>
              <Text variant="bodySmall" style={styles.mutedText}>
                Use fingerprint or face unlock after the local PIN / password is set.
              </Text>
            </View>
            <Switch value={biometricEnabled} onValueChange={setBiometricEnabled} />
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button mode="contained" loading={loading} disabled={loading} onPress={handleSubmit}>
          Save local unlock
        </Button>
      </View>
    </View>
  );
}

export function LocalSecurityLockScreen({
  loading = false,
  onUnlock,
  onUnlockBiometric,
  snapshot,
}: LockProps) {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(snapshot.lockoutRemainingSeconds);
  const autoAttemptedSecretRef = useRef("");
  const autoBiometricPromptedRef = useRef(false);

  useEffect(() => {
    setSecret("");
    setError(null);
    setLockoutRemaining(snapshot.lockoutRemainingSeconds);
    autoAttemptedSecretRef.current = "";
    autoBiometricPromptedRef.current = false;
  }, [snapshot.lockedUntil, snapshot.lockoutRemainingSeconds, snapshot.mode, snapshot.userId]);

  useEffect(() => {
    if (lockoutRemaining <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setLockoutRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  useEffect(() => {
    if (
      loading ||
      lockoutRemaining > 0 ||
      !snapshot.biometricEnabled ||
      !onUnlockBiometric ||
      autoBiometricPromptedRef.current
    ) {
      return;
    }

    autoBiometricPromptedRef.current = true;
    const timer = setTimeout(() => {
      void onUnlockBiometric();
    }, 180);

    return () => clearTimeout(timer);
  }, [loading, lockoutRemaining, onUnlockBiometric, snapshot.biometricEnabled]);

  const attemptUnlock = async (incomingSecret: string): Promise<boolean> => {
    const normalizedSecret = incomingSecret.trim();
    if (!normalizedSecret) {
      setError(`Enter your ${snapshot.mode === "pin" ? "PIN" : "password"} to continue.`);
      return false;
    }

    if (lockoutRemaining > 0) {
      setError(`Too many attempts. Try again in ${lockoutRemaining}s.`);
      return false;
    }

    setError(null);
    const result = await onUnlock(normalizedSecret);
    if (result.success) {
      return true;
    }

    setLockoutRemaining(result.lockoutRemainingSeconds);
    setError(
      result.reason === "locked"
        ? `Too many attempts. Try again in ${result.lockoutRemainingSeconds}s.`
        : `Incorrect local ${snapshot.mode === "pin" ? "PIN" : "password"}.`
    );
    return false;
  };

  useEffect(() => {
    const normalizedSecret = secret.trim();
    const targetLength = snapshot.secretLength ?? 0;
    if (
      loading ||
      lockoutRemaining > 0 ||
      !targetLength ||
      normalizedSecret.length !== targetLength ||
      autoAttemptedSecretRef.current === normalizedSecret
    ) {
      return;
    }

    const timer = setTimeout(() => {
      autoAttemptedSecretRef.current = normalizedSecret;
      void attemptUnlock(normalizedSecret);
    }, snapshot.mode === "pin" ? 120 : 220);

    return () => clearTimeout(timer);
  }, [loading, lockoutRemaining, secret, snapshot.mode, snapshot.secretLength]);

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text variant="headlineSmall" style={styles.title}>
          Unlock MFC Admin
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          This app was locked after inactivity. Use your local {snapshot.mode === "pin" ? "PIN" : "password"} to continue.
        </Text>

        <TextInput
          autoFocus
          mode="outlined"
          keyboardType={snapshot.mode === "pin" ? "number-pad" : "default"}
          label={snapshot.mode === "pin" ? "PIN" : "Password"}
          secureTextEntry
          editable={!loading && lockoutRemaining <= 0}
          value={secret}
          onChangeText={(value) => {
            setSecret(value);
            setError(null);
            if (value.trim().length < (snapshot.secretLength ?? 0)) {
              autoAttemptedSecretRef.current = "";
            }
          }}
          onSubmitEditing={() => {
            autoAttemptedSecretRef.current = secret.trim();
            void attemptUnlock(secret);
          }}
        />

        {snapshot.biometricEnabled && onUnlockBiometric ? (
          <Text variant="bodySmall" style={styles.mutedText}>
            Fingerprint or face unlock is ready for quick access on this device.
          </Text>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          mode="contained"
          loading={loading}
          disabled={loading || lockoutRemaining > 0}
          onPress={() => {
            autoAttemptedSecretRef.current = secret.trim();
            void attemptUnlock(secret);
          }}
        >
          Unlock
        </Button>

        {snapshot.biometricEnabled && onUnlockBiometric ? (
          <Button mode="outlined" disabled={loading} onPress={() => void onUnlockBiometric()}>
            Unlock with biometrics
          </Button>
        ) : null}
      </View>
    </View>
  );
}

export function LocalSecurityLoadingOverlay() {
  return (
    <View style={styles.overlay}>
      <View style={[styles.card, styles.loadingCard]}>
        <ActivityIndicator />
        <Text variant="bodyMedium" style={styles.mutedText}>
          Preparing local security…
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.18)",
    justifyContent: "center",
    paddingHorizontal: 20,
    zIndex: 50,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    gap: 16,
    maxWidth: 520,
    padding: 24,
    width: "100%",
  },
  loadingCard: {
    alignItems: "center",
  },
  title: {
    color: "#0f172a",
    fontWeight: "700",
  },
  subtitle: {
    color: "#64748b",
  },
  mutedText: {
    color: "#64748b",
  },
  errorText: {
    color: "#dc2626",
  },
  modeRow: {
    backgroundColor: "#eef2ff",
    borderColor: "#dbe4f0",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    padding: 4,
  },
  modeButton: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modeButtonActive: {
    backgroundColor: "#2563eb",
  },
  modeButtonText: {
    color: "#475569",
    fontWeight: "600",
  },
  modeButtonTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  timeoutRow: {
    flexDirection: "row",
    gap: 8,
  },
  settingCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    gap: 12,
    padding: 16,
  },
  settingRow: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
    padding: 16,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
});
