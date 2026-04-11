export type DesktopLocalCredentialType = "pin" | "password";
export type DesktopLocalSecurityTimeout = 5 | 15 | 30;

type DesktopLocalSecurityData = {
  enabled: boolean;
  credentialType: DesktopLocalCredentialType;
  hash: string;
  salt: string;
  passkeyCredentialId?: string | null;
  passkeyEnabled: boolean;
  timeoutSeconds: DesktopLocalSecurityTimeout;
};

export type DesktopLocalSecuritySnapshot = {
  enabled: boolean;
  credentialType: DesktopLocalCredentialType | null;
  passkeyEnabled: boolean;
  timeoutSeconds: DesktopLocalSecurityTimeout;
};

const LOCAL_SECURITY_KEY = "mfc_desktop_local_security_v1";

function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (value) => value.toString(16).padStart(2, "0")).join("");
}

async function hashSecret(secret: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${secret}:${salt}`);
  const key = await crypto.subtle.importKey("raw", data, { name: "PBKDF2" }, false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 600000,
      hash: "SHA-256",
    },
    key,
    256
  );

  return Array.from(new Uint8Array(bits), (value) => value.toString(16).padStart(2, "0")).join("");
}

function readSecurityData(): DesktopLocalSecurityData | null {
  const raw = localStorage.getItem(LOCAL_SECURITY_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DesktopLocalSecurityData>;
    if (!parsed.enabled || !parsed.hash || !parsed.salt || !parsed.credentialType) {
      return null;
    }

    const timeout =
      parsed.timeoutSeconds === 5 || parsed.timeoutSeconds === 15 || parsed.timeoutSeconds === 30
        ? parsed.timeoutSeconds
        : 30;

    return {
      credentialType: parsed.credentialType,
      enabled: true,
      hash: parsed.hash,
      passkeyCredentialId: parsed.passkeyCredentialId ?? null,
      passkeyEnabled: Boolean(parsed.passkeyEnabled && parsed.passkeyCredentialId),
      salt: parsed.salt,
      timeoutSeconds: timeout,
    };
  } catch {
    return null;
  }
}

function writeSecurityData(data: DesktopLocalSecurityData): void {
  localStorage.setItem(LOCAL_SECURITY_KEY, JSON.stringify(data));
}

export function getDesktopLocalSecuritySnapshot(): DesktopLocalSecuritySnapshot {
  const data = readSecurityData();
  if (!data) {
    return {
      credentialType: null,
      enabled: false,
      passkeyEnabled: false,
      timeoutSeconds: 30,
    };
  }

  return {
    credentialType: data.credentialType,
    enabled: true,
    passkeyEnabled: Boolean(data.passkeyEnabled && data.passkeyCredentialId),
    timeoutSeconds: data.timeoutSeconds,
  };
}

export async function setupDesktopLocalSecurity({
  credentialType,
  secret,
  timeoutSeconds,
}: {
  credentialType: DesktopLocalCredentialType;
  secret: string;
  timeoutSeconds: DesktopLocalSecurityTimeout;
}): Promise<boolean> {
  if (credentialType === "pin") {
    if (!/^\d{4,6}$/.test(secret)) {
      throw new Error("PIN must be 4 to 6 digits.");
    }
  } else if (secret.trim().length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const current = readSecurityData();
  const salt = generateSalt();
  const hash = await hashSecret(secret, salt);

  writeSecurityData({
    credentialType,
    enabled: true,
    hash,
    passkeyCredentialId: current?.passkeyCredentialId ?? null,
    passkeyEnabled: Boolean(current?.passkeyEnabled && current?.passkeyCredentialId),
    salt,
    timeoutSeconds,
  });

  return true;
}

export async function verifyDesktopLocalSecret(secret: string): Promise<boolean> {
  const current = readSecurityData();
  if (!current) {
    return false;
  }

  const hash = await hashSecret(secret, current.salt);
  return hash === current.hash;
}

export async function changeDesktopLocalSecurity({
  currentSecret,
  nextCredentialType,
  nextSecret,
}: {
  currentSecret: string;
  nextCredentialType: DesktopLocalCredentialType;
  nextSecret: string;
}): Promise<boolean> {
  const isValid = await verifyDesktopLocalSecret(currentSecret);
  if (!isValid) {
    return false;
  }

  const snapshot = getDesktopLocalSecuritySnapshot();
  await setupDesktopLocalSecurity({
    credentialType: nextCredentialType,
    secret: nextSecret,
    timeoutSeconds: snapshot.timeoutSeconds,
  });

  return true;
}

export function updateDesktopLocalSecurityTimeout(
  timeoutSeconds: DesktopLocalSecurityTimeout
): DesktopLocalSecuritySnapshot {
  const current = readSecurityData();
  if (!current) {
    return getDesktopLocalSecuritySnapshot();
  }

  current.timeoutSeconds = timeoutSeconds;
  writeSecurityData(current);
  return getDesktopLocalSecuritySnapshot();
}

export function disableDesktopPasskey(): DesktopLocalSecuritySnapshot {
  const current = readSecurityData();
  if (!current) {
    return getDesktopLocalSecuritySnapshot();
  }

  current.passkeyEnabled = false;
  current.passkeyCredentialId = null;
  writeSecurityData(current);
  return getDesktopLocalSecuritySnapshot();
}

export function disableDesktopLocalSecurity(): void {
  localStorage.removeItem(LOCAL_SECURITY_KEY);
}

export async function isDesktopPasskeyAvailable(): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    return false;
  }

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

function encodeCredentialId(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, "0")).join("");
}

function decodeCredentialId(value: string): ArrayBuffer {
  const bytes = new Uint8Array(value.match(/.{1,2}/g)?.map((part) => Number.parseInt(part, 16)) ?? []);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

export async function setupDesktopPasskey(userId: string): Promise<boolean> {
  const current = readSecurityData();
  if (!current) {
    return false;
  }

  if (!(await isDesktopPasskeyAvailable())) {
    throw new Error("Passkey is not available on this device.");
  }

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  const credential = (await navigator.credentials.create({
    publicKey: {
      attestation: "none",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "required",
      },
      challenge,
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" },
      ],
      rp: {
        name: "MFC Manager Desktop",
      },
      timeout: 60000,
      user: {
        displayName: "MFC Manager Desktop",
        id: new TextEncoder().encode(userId),
        name: userId,
      },
    },
  })) as PublicKeyCredential | null;

  if (!credential) {
    return false;
  }

  current.passkeyCredentialId = encodeCredentialId(credential.rawId);
  current.passkeyEnabled = true;
  writeSecurityData(current);
  return true;
}

export async function verifyDesktopPasskey(): Promise<boolean> {
  const current = readSecurityData();
  if (!current?.passkeyCredentialId) {
    return false;
  }

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  const assertion = (await navigator.credentials.get({
    publicKey: {
      allowCredentials: [
        {
          id: decodeCredentialId(current.passkeyCredentialId),
          transports: ["internal"],
          type: "public-key",
        },
      ],
      challenge,
      timeout: 60000,
      userVerification: "required",
    },
  })) as PublicKeyCredential | null;

  return Boolean(assertion);
}
