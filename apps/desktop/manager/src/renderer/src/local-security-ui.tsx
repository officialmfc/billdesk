import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Fingerprint,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

import type { StaffProfile } from "../../shared/contracts";
import {
  changeDesktopLocalSecurity,
  disableDesktopLocalSecurity,
  disableDesktopPasskey,
  getDesktopLocalSecuritySnapshot,
  isDesktopPasskeyAvailable,
  setupDesktopLocalSecurity,
  setupDesktopPasskey,
  updateDesktopLocalSecurityTimeout,
  verifyDesktopLocalSecret,
  verifyDesktopPasskey,
  type DesktopLocalCredentialType,
  type DesktopLocalSecuritySnapshot,
  type DesktopLocalSecurityTimeout,
} from "./local-security";

type DesktopMessage = { tone: "error" | "success" | "warning"; text: string } | null;

function SecurityShell({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  return (
    <div className="desktop-lock-shell">
      <div className="desktop-lock-card">{children}</div>
    </div>
  );
}

function SecurityTimeoutSelect({
  onChange,
  value,
}: {
  onChange: (value: DesktopLocalSecurityTimeout) => void;
  value: DesktopLocalSecurityTimeout;
}): ReactElement {
  return (
    <select
      className="text-input compact"
      onChange={(event) => onChange(Number(event.target.value) as DesktopLocalSecurityTimeout)}
      value={value}
    >
      <option value={30}>30 seconds</option>
      <option value={15}>15 seconds</option>
      <option value={5}>5 seconds</option>
    </select>
  );
}

export function DesktopLocalSecuritySetup({
  onComplete,
  onLogout,
  profile,
}: {
  onComplete: (snapshot: DesktopLocalSecuritySnapshot) => void;
  onLogout: () => Promise<void>;
  profile: StaffProfile;
}): ReactElement {
  const [credentialType, setCredentialType] = useState<DesktopLocalCredentialType>("pin");
  const [secret, setSecret] = useState("");
  const [confirmSecret, setConfirmSecret] = useState("");
  const [timeoutSeconds, setTimeoutSeconds] = useState<DesktopLocalSecurityTimeout>(30);
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);
  const [step, setStep] = useState<"credential" | "passkey">("credential");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void isDesktopPasskeyAvailable().then(setPasskeyAvailable).catch(() => setPasskeyAvailable(false));
  }, []);

  const secretLabel = credentialType === "pin" ? "PIN" : "Password";
  const secretPlaceholder = credentialType === "pin" ? "••••" : "Enter a local password";

  const canSubmit = useMemo(() => {
    if (!secret || !confirmSecret || secret !== confirmSecret) {
      return false;
    }

    return credentialType === "pin" ? /^\d{4,6}$/.test(secret) : secret.trim().length >= 6;
  }, [confirmSecret, credentialType, secret]);

  const handleCredentialSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      await setupDesktopLocalSecurity({ credentialType, secret, timeoutSeconds });
      if (passkeyAvailable) {
        setStep("passkey");
      } else {
        onComplete(getDesktopLocalSecuritySnapshot());
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save local security.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeySetup = async () => {
    setError("");
    setLoading(true);

    try {
      const ok = await setupDesktopPasskey(profile.user_id);
      if (!ok) {
        throw new Error("Could not enable passkey on this device.");
      }
      onComplete(getDesktopLocalSecuritySnapshot());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not enable passkey.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SecurityShell>
      {step === "credential" ? (
        <>
          <div className="desktop-lock-header">
            <div className="desktop-lock-icon">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1>Set local unlock</h1>
              <p>After your first login, this device needs a PIN or password to reopen the app.</p>
            </div>
          </div>

          <div className="desktop-security-mode-grid">
            <button
              className={credentialType === "pin" ? "primary-button" : "secondary-button"}
              onClick={() => setCredentialType("pin")}
              type="button"
            >
              Use PIN
            </button>
            <button
              className={credentialType === "password" ? "primary-button" : "secondary-button"}
              onClick={() => setCredentialType("password")}
              type="button"
            >
              Use Password
            </button>
          </div>

          <div className="desktop-lock-form">
            <div className="field-block">
              <label className="field-label">{secretLabel}</label>
              <input
                autoFocus
                className="text-input"
                inputMode={credentialType === "pin" ? "numeric" : "text"}
                maxLength={credentialType === "pin" ? 6 : undefined}
                onChange={(event) =>
                  setSecret(
                    credentialType === "pin"
                      ? event.target.value.replace(/\D/g, "")
                      : event.target.value
                  )
                }
                placeholder={secretPlaceholder}
                type="password"
                value={secret}
              />
              <div className="field-helper">
                {credentialType === "pin"
                  ? "Use 4 to 6 digits."
                  : "Use at least 6 characters."}
              </div>
            </div>

            <div className="field-block">
              <label className="field-label">Confirm {secretLabel.toLowerCase()}</label>
              <input
                className="text-input"
                inputMode={credentialType === "pin" ? "numeric" : "text"}
                maxLength={credentialType === "pin" ? 6 : undefined}
                onChange={(event) =>
                  setConfirmSecret(
                    credentialType === "pin"
                      ? event.target.value.replace(/\D/g, "")
                      : event.target.value
                  )
                }
                placeholder={secretPlaceholder}
                type="password"
                value={confirmSecret}
              />
            </div>

            <div className="field-block">
              <label className="field-label">Auto-lock after inactivity</label>
              <SecurityTimeoutSelect onChange={setTimeoutSeconds} value={timeoutSeconds} />
            </div>
          </div>

          {error ? <div className="banner error">{error}</div> : null}

          <div className="desktop-lock-actions">
            <button className="secondary-button" onClick={() => void onLogout()} type="button">
              <LogOut size={16} />
              Logout
            </button>
            <button className="primary-button" disabled={!canSubmit || loading} onClick={() => void handleCredentialSubmit()} type="button">
              {loading ? "Saving..." : "Continue"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="desktop-lock-header">
            <div className="desktop-lock-icon">
              <Fingerprint size={28} />
            </div>
            <div>
              <h1>Add passkey for fast unlock</h1>
              <p>Use a platform passkey when this device supports it. Your PIN/password remains as fallback.</p>
            </div>
          </div>

          {error ? <div className="banner error">{error}</div> : null}

          <div className="desktop-lock-actions">
            <button className="secondary-button" onClick={() => onComplete(getDesktopLocalSecuritySnapshot())} type="button">
              Skip
            </button>
            <button className="primary-button" disabled={loading} onClick={() => void handlePasskeySetup()} type="button">
              {loading ? "Setting up..." : "Enable Passkey"}
            </button>
          </div>
        </>
      )}
    </SecurityShell>
  );
}

export function DesktopLocalSecurityLock({
  onLogout,
  onUnlock,
  snapshot,
}: {
  onLogout: () => Promise<void>;
  onUnlock: () => void;
  snapshot: DesktopLocalSecuritySnapshot;
}): ReactElement {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);

  const label = snapshot.credentialType === "password" ? "password" : "PIN";

  const handleSecretUnlock = async () => {
    setError("");
    setLoading(true);

    try {
      const valid = await verifyDesktopLocalSecret(secret);
      if (valid) {
        setSecret("");
        onUnlock();
        return;
      }

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setSecret("");

      if (nextAttempts >= 5) {
        setError("Too many failed attempts. Logging out.");
        window.setTimeout(() => {
          void onLogout();
        }, 800);
      } else {
        setError(`Invalid ${label}. ${5 - nextAttempts} attempts remaining.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyUnlock = async () => {
    setError("");
    setLoading(true);

    try {
      const valid = await verifyDesktopPasskey();
      if (valid) {
        onUnlock();
        return;
      }
      setError("Passkey verification failed. Use your PIN/password instead.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Passkey verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SecurityShell>
      <div className="desktop-lock-header">
        <div className="desktop-lock-icon">
          <Lock size={28} />
        </div>
        <div>
          <h1>App locked</h1>
          <p>The desktop manager locked after inactivity. Unlock to continue.</p>
        </div>
      </div>

      {snapshot.passkeyEnabled ? (
        <button className="secondary-button desktop-passkey-button" disabled={loading} onClick={() => void handlePasskeyUnlock()} type="button">
          <Fingerprint size={16} />
          {loading ? "Checking passkey..." : "Use Passkey"}
        </button>
      ) : null}

      <div className="desktop-lock-form">
        <div className="field-block">
          <label className="field-label">
            Enter {snapshot.credentialType === "password" ? "password" : "PIN"}
          </label>
          <input
            autoFocus
            className="text-input"
            inputMode={snapshot.credentialType === "pin" ? "numeric" : "text"}
            maxLength={snapshot.credentialType === "pin" ? 6 : undefined}
            onChange={(event) =>
              setSecret(
                snapshot.credentialType === "pin"
                  ? event.target.value.replace(/\D/g, "")
                  : event.target.value
              )
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" && secret.trim()) {
                void handleSecretUnlock();
              }
            }}
            placeholder={snapshot.credentialType === "pin" ? "••••" : "Password"}
            type="password"
            value={secret}
          />
        </div>
      </div>

      {error ? <div className="banner error">{error}</div> : null}

      <div className="desktop-lock-actions">
        <button className="secondary-button" onClick={() => void onLogout()} type="button">
          <LogOut size={16} />
          Logout
        </button>
        <button className="primary-button" disabled={loading || !secret.trim()} onClick={() => void handleSecretUnlock()} type="button">
          {loading ? "Unlocking..." : "Unlock"}
        </button>
      </div>
    </SecurityShell>
  );
}

export function DesktopLocalSecuritySettings({
  onLock,
  onLogout,
  onSnapshotChange,
  profile,
  snapshot,
}: {
  onLock: () => void;
  onLogout: () => Promise<void>;
  onSnapshotChange: (snapshot: DesktopLocalSecuritySnapshot) => void;
  profile: StaffProfile;
  snapshot: DesktopLocalSecuritySnapshot;
}): ReactElement {
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);
  const [changing, setChanging] = useState(false);
  const [currentSecret, setCurrentSecret] = useState("");
  const [nextSecret, setNextSecret] = useState("");
  const [nextConfirm, setNextConfirm] = useState("");
  const [nextType, setNextType] = useState<DesktopLocalCredentialType>(snapshot.credentialType ?? "pin");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNextType(snapshot.credentialType ?? "pin");
  }, [snapshot.credentialType]);

  useEffect(() => {
    void isDesktopPasskeyAvailable().then(setPasskeyAvailable).catch(() => setPasskeyAvailable(false));
  }, []);

  const handleChangeSecret = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (nextType === "pin") {
        if (!/^\d{4,6}$/.test(nextSecret)) {
          throw new Error("PIN must be 4 to 6 digits.");
        }
      } else if (nextSecret.trim().length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      if (nextSecret !== nextConfirm) {
        throw new Error("New secret does not match confirmation.");
      }

      const ok = await changeDesktopLocalSecurity({
        currentSecret,
        nextCredentialType: nextType,
        nextSecret,
      });
      if (!ok) {
        throw new Error("Current secret is incorrect.");
      }

      onSnapshotChange(getDesktopLocalSecuritySnapshot());
      setChanging(false);
      setCurrentSecret("");
      setNextSecret("");
      setNextConfirm("");
      setSuccess(nextType === "pin" ? "PIN updated." : "Password updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not change local security.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisableSecurity = async () => {
    disableDesktopLocalSecurity();
    onSnapshotChange(getDesktopLocalSecuritySnapshot());
    await onLogout();
  };

  const handleEnablePasskey = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const ok = await setupDesktopPasskey(profile.user_id);
      if (!ok) {
        throw new Error("Could not enable passkey.");
      }
      onSnapshotChange(getDesktopLocalSecuritySnapshot());
      setSuccess("Passkey enabled.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not enable passkey.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-settings-card">
      <div className="section-heading">
        <div>
          <h3>Local Security</h3>
          <p>Lock this desktop app with a local PIN/password and optional passkey.</p>
        </div>
        <button className="secondary-button" onClick={onLock} type="button">
          <Lock size={16} />
          Lock now
        </button>
      </div>

      <div className="admin-settings-grid">
        <div className="admin-settings-metric">
          <span>Status</span>
          <strong>{snapshot.enabled ? "Enabled" : "Disabled"}</strong>
        </div>
        <div className="admin-settings-metric">
          <span>Unlock method</span>
          <strong>{snapshot.credentialType === "password" ? "Password" : "PIN"}</strong>
        </div>
        <div className="admin-settings-metric">
          <span>Passkey</span>
          <strong>{snapshot.passkeyEnabled ? "Enabled" : passkeyAvailable ? "Available" : "Unavailable"}</strong>
        </div>
      </div>

      <div className="admin-settings-grid">
        <div className="field-block" style={{ maxWidth: 240 }}>
          <label className="field-label">Auto-lock after inactivity</label>
          <SecurityTimeoutSelect
            onChange={(value) => {
              onSnapshotChange(updateDesktopLocalSecurityTimeout(value));
            }}
            value={snapshot.timeoutSeconds}
          />
        </div>
        <div className="desktop-security-actions">
          {passkeyAvailable && !snapshot.passkeyEnabled ? (
            <button className="secondary-button" disabled={loading} onClick={() => void handleEnablePasskey()} type="button">
              <Fingerprint size={16} />
              Enable passkey
            </button>
          ) : null}
          {snapshot.passkeyEnabled ? (
            <button
              className="secondary-button"
              disabled={loading}
              onClick={() => {
                onSnapshotChange(disableDesktopPasskey());
                setSuccess("Passkey removed.");
                setError("");
              }}
              type="button"
            >
              Disable passkey
            </button>
          ) : null}
          <button className="danger-button" disabled={loading} onClick={() => void handleDisableSecurity()} type="button">
            <ShieldOff size={16} />
            Disable & logout
          </button>
        </div>
      </div>

      {changing ? (
        <div className="desktop-lock-form">
          <div className="desktop-security-mode-grid">
            <button
              className={nextType === "pin" ? "primary-button" : "secondary-button"}
              onClick={() => setNextType("pin")}
              type="button"
            >
              New PIN
            </button>
            <button
              className={nextType === "password" ? "primary-button" : "secondary-button"}
              onClick={() => setNextType("password")}
              type="button"
            >
              New Password
            </button>
          </div>
          <div className="field-block">
            <label className="field-label">Current {snapshot.credentialType === "password" ? "password" : "PIN"}</label>
            <input
              className="text-input"
              inputMode={snapshot.credentialType === "pin" ? "numeric" : "text"}
              onChange={(event) =>
                setCurrentSecret(
                  snapshot.credentialType === "pin"
                    ? event.target.value.replace(/\D/g, "")
                    : event.target.value
                )
              }
              type="password"
              value={currentSecret}
            />
          </div>
          <div className="field-block">
            <label className="field-label">New {nextType === "password" ? "password" : "PIN"}</label>
            <input
              className="text-input"
              inputMode={nextType === "pin" ? "numeric" : "text"}
              onChange={(event) =>
                setNextSecret(nextType === "pin" ? event.target.value.replace(/\D/g, "") : event.target.value)
              }
              type="password"
              value={nextSecret}
            />
          </div>
          <div className="field-block">
            <label className="field-label">Confirm new {nextType === "password" ? "password" : "PIN"}</label>
            <input
              className="text-input"
              inputMode={nextType === "pin" ? "numeric" : "text"}
              onChange={(event) =>
                setNextConfirm(nextType === "pin" ? event.target.value.replace(/\D/g, "") : event.target.value)
              }
              type="password"
              value={nextConfirm}
            />
          </div>
          <div className="desktop-lock-actions">
            <button
              className="secondary-button"
              onClick={() => {
                setChanging(false);
                setCurrentSecret("");
                setNextSecret("");
                setNextConfirm("");
                setError("");
              }}
              type="button"
            >
              Cancel
            </button>
            <button className="primary-button" disabled={loading} onClick={() => void handleChangeSecret()} type="button">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <button className="secondary-button" onClick={() => setChanging(true)} type="button">
          <RefreshCw size={16} />
          Change PIN / Password
        </button>
      )}

      {error ? <div className="banner error">{error}</div> : null}
      {success ? <div className="banner success">{success}</div> : null}
    </section>
  );
}
