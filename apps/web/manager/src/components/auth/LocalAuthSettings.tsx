"use client";

import {
    changePin,
    disableBiometric,
    disableLocalAuth,
    getLocalAuthType,
    isBiometricAvailable,
    isBiometricEnabled,
    isLocalAuthEnabled,
    setupBiometricAuth,
    type LocalAuthType
} from "@/lib/local-auth";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@mfc/auth";
import { Fingerprint, Hash, LogOut, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function LocalAuthSettings() {
    const { user } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [authEnabled, setAuthEnabled] = useState(false);
    const [authType, setAuthType] = useState<LocalAuthType>("none");
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [showChangePin, setShowChangePin] = useState(false);

    const [oldPin, setOldPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmNewPin, setConfirmNewPin] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setAuthEnabled(isLocalAuthEnabled());
        setAuthType(getLocalAuthType());
        const available = await isBiometricAvailable();
        setBiometricAvailable(available);
        const enabled = await isBiometricEnabled();
        setBiometricEnabled(enabled);
    };

    const handleDisable = async () => {
        if (confirm("Disabling local authentication will log you out. Are you sure?")) {
            disableLocalAuth();
            setAuthEnabled(false);
            setAuthType("none");

            // Log out user
            try {
                await supabase.auth.signOut();
                router.push("/auth/login");
            } catch (error) {
                logger.error(error, "Logout error during auth disable");
            }
        }
    };

    const handleChangePin = async () => {
        setError("");
        setSuccess("");

        if (newPin.length < 4) {
            setError("PIN must be at least 4 digits");
            return;
        }

        if (newPin !== confirmNewPin) {
            setError("New PINs do not match");
            return;
        }

        const success = await changePin(oldPin, newPin);
        if (success) {
            setSuccess("PIN changed successfully");
            setShowChangePin(false);
            setOldPin("");
            setNewPin("");
            setConfirmNewPin("");
        } else {
            setError("Failed to change PIN. Check your current PIN.");
        }
    };

    const handleEnableBiometric = async () => {
        if (!user) return;

        setError("");
        setSuccess("");

        const success = await setupBiometricAuth(user.id);
        if (success) {
            setSuccess("Biometric authentication enabled");
            await loadSettings();
        } else {
            setError("Failed to enable biometric authentication");
        }
    };

    const handleDisableBiometric = async () => {
        if (confirm("Disable biometric authentication? You'll still be able to use your PIN.")) {
            disableBiometric();
            setBiometricEnabled(false);
            setAuthType("pin");
            setSuccess("Biometric authentication disabled");
        }
    };

    const handleEnablePin = async () => {
        setShowChangePin(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">Local Authentication</h3>
                <p className="text-sm text-muted-foreground">
                    Secure your app with PIN or biometric authentication
                </p>
            </div>

            {/* Status */}
            <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {authEnabled ? (
                            <ShieldCheck className="h-8 w-8 text-green-600" />
                        ) : (
                            <ShieldAlert className="h-8 w-8 text-yellow-600" />
                        )}
                        <div>
                            <div className="font-medium">Status</div>
                            <div className="text-sm text-muted-foreground">
                                {authEnabled ? (
                                    <span className="text-green-600">
                                        Enabled ({authType === "pin" ? "PIN" : "Biometric"})
                                    </span>
                                ) : (
                                    <span className="text-yellow-600">Disabled</span>
                                )}
                            </div>
                        </div>
                    </div>
                    {authEnabled && (
                        <button
                            onClick={handleDisable}
                            className="flex items-center gap-2 rounded-md border border-red-200 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                        >
                            <LogOut className="h-4 w-4" />
                            Disable & Logout
                        </button>
                    )}
                </div>
            </div>

            {/* Enable Options */}
            {!authEnabled && (
                <div className="space-y-3">
                    <button
                        onClick={handleEnablePin}
                        className="w-full rounded-lg border bg-card p-4 text-left hover:bg-accent transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Hash className="h-6 w-6 text-primary" />
                            <div className="flex-1">
                                <div className="font-medium">Enable PIN</div>
                                <div className="text-sm text-muted-foreground">
                                    Use a 4-6 digit PIN to unlock
                                </div>
                            </div>
                        </div>
                    </button>

                    {biometricAvailable && (
                        <button
                            onClick={handleEnableBiometric}
                            className="w-full rounded-lg border bg-card p-4 text-left hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Fingerprint className="h-6 w-6 text-primary" />
                                <div className="flex-1">
                                    <div className="font-medium">Enable Biometric</div>
                                    <div className="text-sm text-muted-foreground">
                                        Use fingerprint or face recognition
                                    </div>
                                </div>
                            </div>
                        </button>
                    )}
                </div>
            )}

            {/* Biometric Toggle - Show when auth is enabled and biometric is available */}
            {authEnabled && biometricAvailable && !showChangePin && (
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Fingerprint className="h-6 w-6 text-primary" />
                            <div>
                                <div className="font-medium">Biometric Authentication</div>
                                <div className="text-sm text-muted-foreground">
                                    {biometricEnabled ? "Enabled" : "Disabled"}
                                </div>
                            </div>
                        </div>
                        {biometricEnabled ? (
                            <button
                                onClick={handleDisableBiometric}
                                className="rounded-md border border-input px-3 py-1 text-sm font-medium hover:bg-accent"
                            >
                                Disable
                            </button>
                        ) : (
                            <button
                                onClick={handleEnableBiometric}
                                className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Enable
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Change PIN - Always show when auth is enabled (PIN is always set) */}
            {authEnabled && !showChangePin && (
                <button
                    onClick={() => setShowChangePin(true)}
                    className="w-full rounded-lg border bg-card p-4 text-left hover:bg-accent transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <RefreshCw className="h-6 w-6 text-primary" />
                        <div className="flex-1">
                            <div className="font-medium">Change PIN</div>
                            <div className="text-sm text-muted-foreground">
                                Update your security PIN
                            </div>
                        </div>
                    </div>
                </button>
            )}

            {/* Change PIN Form */}
            {showChangePin && (
                <div className="space-y-4 rounded-lg border bg-card p-4">
                    <div>
                        <h4 className="font-medium">Change PIN</h4>
                        <p className="text-sm text-muted-foreground">
                            Enter your current PIN and choose a new one
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium">Current PIN</label>
                            <input
                                name="pin-current-field"
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={oldPin}
                                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ""))}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-center tracking-widest"
                                placeholder="••••"
                                autoComplete="one-time-code"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                data-form-type="other"
                                data-lpignore="true"
                                data-1p-ignore="true"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">New PIN</label>
                            <input
                                name="pin-new-field"
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-center tracking-widest"
                                placeholder="••••"
                                autoComplete="one-time-code"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                data-form-type="other"
                                data-lpignore="true"
                                data-1p-ignore="true"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Confirm New PIN</label>
                            <input
                                name="pin-new-confirm-field"
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={confirmNewPin}
                                onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ""))}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-center tracking-widest"
                                placeholder="••••"
                                autoComplete="one-time-code"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                data-form-type="other"
                                data-lpignore="true"
                                data-1p-ignore="true"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleChangePin}
                            className="flex-1 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Change PIN
                        </button>
                        <button
                            onClick={() => {
                                setShowChangePin(false);
                                setOldPin("");
                                setNewPin("");
                                setConfirmNewPin("");
                                setError("");
                            }}
                            className="rounded-md border border-input px-4 py-2 font-medium hover:bg-accent"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Messages */}
            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
                    {error}
                </div>
            )}
            {success && (
                <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100">
                    {success}
                </div>
            )}

            {/* Info */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
                <p className="font-medium">How it works:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>App locks when you switch tabs or close it</li>
                    <li>Requires authentication to unlock</li>
                    <li>After 5 failed attempts, you'll be logged out</li>
                    <li>Your data stays secure even if device is stolen</li>
                </ul>
            </div>
        </div>
    );
}
