import {
  AppState,
  Keyboard,
  Platform,
  type AppStateStatus,
} from "react-native";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import {
  authenticateWithMobileBiometrics,
  clearMobileLocalSecurity,
  getMobileLocalSecuritySnapshot,
  setupMobileLocalSecurity,
  type MobileLocalSecurityMode,
  type MobileLocalSecuritySnapshot,
  type MobileLocalSecurityTimeoutSeconds,
  type MobileLocalSecurityVerifyResult,
  updateMobileLocalSecurityBiometric,
  updateMobileLocalSecurityTimeout,
  verifyMobileLocalSecuritySecret,
} from "@/lib/local-security";

type LocalSecurityContextValue = {
  isLoading: boolean;
  isLocked: boolean;
  lockNow: () => void;
  refresh: () => Promise<void>;
  registerInteraction: () => void;
  requiresSetup: boolean;
  resetLocalSecurity: () => Promise<void>;
  saveSetup: (params: {
    biometricEnabled: boolean;
    mode: MobileLocalSecurityMode;
    secret: string;
    timeoutSeconds: MobileLocalSecurityTimeoutSeconds;
  }) => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  setTimeoutSeconds: (timeoutSeconds: MobileLocalSecurityTimeoutSeconds) => Promise<void>;
  snapshot: MobileLocalSecuritySnapshot;
  unlockWithBiometric: () => Promise<boolean>;
  unlockWithSecret: (secret: string) => Promise<MobileLocalSecurityVerifyResult>;
};

const DEFAULT_SNAPSHOT: MobileLocalSecuritySnapshot = {
  biometricAvailable: false,
  biometricEnabled: false,
  enabled: false,
  lockedUntil: null,
  lockoutRemainingSeconds: 0,
  mode: null,
  secretLength: null,
  timeoutSeconds: 30,
  userId: null,
};

const LocalSecurityContext = createContext<LocalSecurityContextValue | undefined>(undefined);

export function LocalSecurityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.user_id ?? null;
  const [snapshot, setSnapshot] = useState<MobileLocalSecuritySnapshot>(DEFAULT_SNAPSHOT);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundAtRef = useRef<number | null>(null);
  const keyboardVisibleRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const clearInactivityTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const refresh = useCallback(async () => {
    if (Platform.OS === "web") {
      clearInactivityTimer();
      setSnapshot(DEFAULT_SNAPSHOT);
      setRequiresSetup(false);
      setIsLocked(false);
      setIsLoading(false);
      return;
    }

    if (!userId) {
      clearInactivityTimer();
      setSnapshot(DEFAULT_SNAPSHOT);
      setRequiresSetup(false);
      setIsLocked(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const nextSnapshot = await getMobileLocalSecuritySnapshot(userId);
    setSnapshot(nextSnapshot);
    setRequiresSetup(false);
    setIsLocked(nextSnapshot.enabled);
    setIsLoading(false);
  }, [clearInactivityTimer, userId]);

  const startInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    if (
      !userId ||
      Platform.OS === "web" ||
      !snapshot.enabled ||
      isLoading ||
      isLocked ||
      requiresSetup ||
      keyboardVisibleRef.current ||
      appStateRef.current !== "active"
    ) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setIsLocked(true);
    }, snapshot.timeoutSeconds * 1000);
  }, [clearInactivityTimer, isLoading, isLocked, requiresSetup, snapshot.enabled, snapshot.timeoutSeconds, userId]);

  const registerInteraction = useCallback(() => {
    if (!snapshot.enabled || isLocked || requiresSetup) {
      return;
    }
    startInactivityTimer();
  }, [isLocked, requiresSetup, snapshot.enabled, startInactivityTimer]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!snapshot.enabled) {
      clearInactivityTimer();
      return;
    }

    startInactivityTimer();
    return clearInactivityTimer;
  }, [clearInactivityTimer, snapshot.enabled, startInactivityTimer]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => {
      keyboardVisibleRef.current = true;
      clearInactivityTimer();
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardVisibleRef.current = false;
      startInactivityTimer();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [clearInactivityTimer, startInactivityTimer]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (nextState === "background" || nextState === "inactive") {
        backgroundAtRef.current = Date.now();
        clearInactivityTimer();
        return;
      }

      if (nextState === "active" && previousState !== "active") {
        const backgroundSeconds = backgroundAtRef.current
          ? Math.floor((Date.now() - backgroundAtRef.current) / 1000)
          : 0;
        backgroundAtRef.current = null;

        if (snapshot.enabled && backgroundSeconds >= snapshot.timeoutSeconds) {
          setIsLocked(true);
          return;
        }

        startInactivityTimer();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [clearInactivityTimer, snapshot.enabled, snapshot.timeoutSeconds, startInactivityTimer]);

  const saveSetup = useCallback(
    async (params: {
      biometricEnabled: boolean;
      mode: MobileLocalSecurityMode;
      secret: string;
      timeoutSeconds: MobileLocalSecurityTimeoutSeconds;
    }) => {
      if (!userId) {
        return;
      }

      setIsLoading(true);
      const nextSnapshot = await setupMobileLocalSecurity({
        ...params,
        userId,
      });
      setSnapshot(nextSnapshot);
      setRequiresSetup(false);
      setIsLocked(false);
      setIsLoading(false);
      startInactivityTimer();
    },
    [startInactivityTimer, userId]
  );

  const unlockWithSecret = useCallback(
    async (secret: string) => {
      if (!userId) {
        return {
          lockoutRemainingSeconds: 0,
          reason: "missing" as const,
          success: false,
        };
      }

      const result = await verifyMobileLocalSecuritySecret(userId, secret);
      const nextSnapshot = await getMobileLocalSecuritySnapshot(userId);
      setSnapshot(nextSnapshot);

      if (!result.success) {
        setIsLocked(true);
        return result;
      }

      setIsLocked(false);
      startInactivityTimer();
      return result;
    },
    [startInactivityTimer, userId]
  );

  const unlockWithBiometric = useCallback(async () => {
    if (!snapshot.enabled || !snapshot.biometricEnabled) {
      return false;
    }

    const success = await authenticateWithMobileBiometrics();
    if (success) {
      setIsLocked(false);
      startInactivityTimer();
    }

    return success;
  }, [snapshot.biometricEnabled, snapshot.enabled, startInactivityTimer]);

  const setTimeoutSeconds = useCallback(
    async (timeoutSeconds: MobileLocalSecurityTimeoutSeconds) => {
      if (!userId || !snapshot.enabled) {
        return;
      }

      const nextSnapshot = await updateMobileLocalSecurityTimeout(userId, timeoutSeconds);
      setSnapshot(nextSnapshot);
      startInactivityTimer();
    },
    [snapshot.enabled, startInactivityTimer, userId]
  );

  const setBiometricEnabled = useCallback(
    async (enabled: boolean) => {
      if (!userId || !snapshot.enabled) {
        return;
      }

      const nextSnapshot = await updateMobileLocalSecurityBiometric(userId, enabled);
      setSnapshot(nextSnapshot);
    },
    [snapshot.enabled, userId]
  );

  const resetLocalSecurity = useCallback(async () => {
    if (!userId) {
      return;
    }

    await clearMobileLocalSecurity(userId);
    clearInactivityTimer();
    setSnapshot({
      ...DEFAULT_SNAPSHOT,
      biometricAvailable: snapshot.biometricAvailable,
      userId,
    });
    setRequiresSetup(true);
    setIsLocked(false);
  }, [clearInactivityTimer, snapshot.biometricAvailable, userId]);

  const lockNow = useCallback(() => {
    if (!snapshot.enabled) {
      return;
    }
    clearInactivityTimer();
    setIsLocked(true);
  }, [clearInactivityTimer, snapshot.enabled]);

  const value = useMemo<LocalSecurityContextValue>(
    () => ({
      isLoading,
      isLocked,
      lockNow,
      refresh,
      registerInteraction,
      requiresSetup,
      resetLocalSecurity,
      saveSetup,
      setBiometricEnabled,
      setTimeoutSeconds,
      snapshot,
      unlockWithBiometric,
      unlockWithSecret,
    }),
    [
      isLoading,
      isLocked,
      lockNow,
      refresh,
      registerInteraction,
      requiresSetup,
      resetLocalSecurity,
      saveSetup,
      setBiometricEnabled,
      setTimeoutSeconds,
      snapshot,
      unlockWithBiometric,
      unlockWithSecret,
    ]
  );

  return <LocalSecurityContext.Provider value={value}>{children}</LocalSecurityContext.Provider>;
}

export function useLocalSecurity() {
  const context = useContext(LocalSecurityContext);
  if (!context) {
    throw new Error("useLocalSecurity must be used within LocalSecurityProvider");
  }

  return context;
}
