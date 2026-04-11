import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export type MobileLocalSecurityMode = "pin" | "password";
export type MobileLocalSecurityTimeoutSeconds = 5 | 15 | 30;

type MobileLocalSecurityRecord = {
  biometricEnabled: boolean;
  failedAttempts: number;
  lockedUntil: number | null;
  mode: MobileLocalSecurityMode;
  secret: string;
  secretLength: number;
  timeoutSeconds: MobileLocalSecurityTimeoutSeconds;
  userId: string;
};

export type MobileLocalSecuritySnapshot = {
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  enabled: boolean;
  lockedUntil: number | null;
  lockoutRemainingSeconds: number;
  mode: MobileLocalSecurityMode | null;
  secretLength: number | null;
  timeoutSeconds: MobileLocalSecurityTimeoutSeconds;
  userId: string | null;
};

export type MobileLocalSecurityVerifyResult = {
  lockoutRemainingSeconds: number;
  reason: "invalid" | "locked" | "missing" | null;
  success: boolean;
};

const STORAGE_PREFIX = "manager_mobile_local_security_";
const DEFAULT_TIMEOUT: MobileLocalSecurityTimeoutSeconds = 30;
const LOCKOUT_AFTER_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30_000;

type LocalAuthenticationModule = typeof import("expo-local-authentication");

function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

function getLockoutRemainingSeconds(lockedUntil: number | null): number {
  if (!lockedUntil) {
    return 0;
  }

  return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
}

function getDefaultSnapshot(
  overrides: Partial<MobileLocalSecuritySnapshot> = {}
): MobileLocalSecuritySnapshot {
  return {
    biometricAvailable: false,
    biometricEnabled: false,
    enabled: false,
    lockedUntil: null,
    lockoutRemainingSeconds: 0,
    mode: null,
    secretLength: null,
    timeoutSeconds: DEFAULT_TIMEOUT,
    userId: null,
    ...overrides,
  };
}

async function getBiometricAvailability(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  try {
    const LocalAuthentication = require("expo-local-authentication") as LocalAuthenticationModule;
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return false;
    }

    return await LocalAuthentication.isEnrolledAsync();
  } catch {
    return false;
  }
}

async function readRecord(userId: string): Promise<MobileLocalSecurityRecord | null> {
  const raw = await SecureStore.getItemAsync(getStorageKey(userId));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MobileLocalSecurityRecord>;
    if (
      parsed.userId !== userId ||
      (parsed.mode !== "pin" && parsed.mode !== "password") ||
      typeof parsed.secret !== "string" ||
      !parsed.secret
    ) {
      return null;
    }

    const timeoutSeconds =
      parsed.timeoutSeconds === 5 || parsed.timeoutSeconds === 15 || parsed.timeoutSeconds === 30
        ? parsed.timeoutSeconds
        : DEFAULT_TIMEOUT;

    return {
      biometricEnabled: Boolean(parsed.biometricEnabled),
      failedAttempts:
        typeof parsed.failedAttempts === "number" && parsed.failedAttempts >= 0
          ? parsed.failedAttempts
          : 0,
      lockedUntil:
        typeof parsed.lockedUntil === "number" && Number.isFinite(parsed.lockedUntil)
          ? parsed.lockedUntil
          : null,
      mode: parsed.mode,
      secret: parsed.secret,
      secretLength:
        typeof parsed.secretLength === "number" && parsed.secretLength > 0
          ? parsed.secretLength
          : parsed.secret.length,
      timeoutSeconds,
      userId,
    };
  } catch {
    return null;
  }
}

async function writeRecord(record: MobileLocalSecurityRecord): Promise<void> {
  await SecureStore.setItemAsync(getStorageKey(record.userId), JSON.stringify(record));
}

export async function getMobileLocalSecuritySnapshot(
  userId?: string | null
): Promise<MobileLocalSecuritySnapshot> {
  const biometricAvailable = await getBiometricAvailability();
  if (!userId) {
    return getDefaultSnapshot({ biometricAvailable });
  }

  const record = await readRecord(userId);
  if (!record) {
    return getDefaultSnapshot({ biometricAvailable, userId });
  }

  const lockoutRemainingSeconds = getLockoutRemainingSeconds(record.lockedUntil);

  return {
    biometricAvailable,
    biometricEnabled: biometricAvailable && record.biometricEnabled,
    enabled: true,
    lockedUntil: lockoutRemainingSeconds > 0 ? record.lockedUntil : null,
    lockoutRemainingSeconds,
    mode: record.mode,
    secretLength: record.secretLength,
    timeoutSeconds: record.timeoutSeconds,
    userId,
  };
}

export async function setupMobileLocalSecurity(params: {
  biometricEnabled: boolean;
  mode: MobileLocalSecurityMode;
  secret: string;
  timeoutSeconds: MobileLocalSecurityTimeoutSeconds;
  userId: string;
}): Promise<MobileLocalSecuritySnapshot> {
  await writeRecord({
    biometricEnabled: params.biometricEnabled,
    failedAttempts: 0,
    lockedUntil: null,
    mode: params.mode,
    secret: params.secret,
    secretLength: params.secret.length,
    timeoutSeconds: params.timeoutSeconds,
    userId: params.userId,
  });

  return getMobileLocalSecuritySnapshot(params.userId);
}

export async function verifyMobileLocalSecuritySecret(
  userId: string,
  secret: string
): Promise<MobileLocalSecurityVerifyResult> {
  const record = await readRecord(userId);
  if (!record) {
    return {
      lockoutRemainingSeconds: 0,
      reason: "missing",
      success: false,
    };
  }

  const existingLockoutRemaining = getLockoutRemainingSeconds(record.lockedUntil);
  if (existingLockoutRemaining > 0) {
    return {
      lockoutRemainingSeconds: existingLockoutRemaining,
      reason: "locked",
      success: false,
    };
  }

  if (record.secret === secret) {
    if (record.failedAttempts !== 0 || record.lockedUntil) {
      await writeRecord({
        ...record,
        failedAttempts: 0,
        lockedUntil: null,
      });
    }

    return {
      lockoutRemainingSeconds: 0,
      reason: null,
      success: true,
    };
  }

  const failedAttempts = record.failedAttempts + 1;
  const lockedUntil =
    failedAttempts >= LOCKOUT_AFTER_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : null;

  await writeRecord({
    ...record,
    failedAttempts: lockedUntil ? 0 : failedAttempts,
    lockedUntil,
  });

  return {
    lockoutRemainingSeconds: getLockoutRemainingSeconds(lockedUntil),
    reason: lockedUntil ? "locked" : "invalid",
    success: false,
  };
}

export async function updateMobileLocalSecurityTimeout(
  userId: string,
  timeoutSeconds: MobileLocalSecurityTimeoutSeconds
): Promise<MobileLocalSecuritySnapshot> {
  const record = await readRecord(userId);
  if (!record) {
    return getMobileLocalSecuritySnapshot(userId);
  }

  await writeRecord({
    ...record,
    timeoutSeconds,
  });
  return getMobileLocalSecuritySnapshot(userId);
}

export async function updateMobileLocalSecurityBiometric(
  userId: string,
  biometricEnabled: boolean
): Promise<MobileLocalSecuritySnapshot> {
  const record = await readRecord(userId);
  if (!record) {
    return getMobileLocalSecuritySnapshot(userId);
  }

  await writeRecord({
    ...record,
    biometricEnabled,
  });
  return getMobileLocalSecuritySnapshot(userId);
}

export async function clearMobileLocalSecurity(userId: string): Promise<void> {
  await SecureStore.deleteItemAsync(getStorageKey(userId));
}

export async function authenticateWithMobileBiometrics(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  try {
    const LocalAuthentication = require("expo-local-authentication") as LocalAuthenticationModule;
    const result = await LocalAuthentication.authenticateAsync({
      cancelLabel: "Use PIN instead",
      disableDeviceFallback: false,
      promptMessage: "Unlock MFC Manager",
    });

    return result.success;
  } catch {
    return false;
  }
}
