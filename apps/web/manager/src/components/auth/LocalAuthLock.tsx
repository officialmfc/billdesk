"use client";

import {
    disableLocalAuth,
    getLocalAuthType,
    isBiometricAvailable,
    verifyBiometric,
    verifyPin,
    type LocalAuthType
} from "@/lib/local-auth";
import { useAuth } from "@mfc/auth";
import { Fingerprint, Lock, LogOut, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface LocalAuthLockProps {
    onUnlock: () => void;
}

export function LocalAuthLock({ onUnlock }: LocalAuthLockProps) {
    const [authType, setAuthType] = useState<LocalAuthType>("none");
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const { signOut } = useAuth();

    useEffect(() => {
        const type = getLocalAuthType();
        setAuthType(type);

        isBiometricAvailable().then(setBiometricAvailable);

        // Don't auto-trigger biometric - wait for user to click
    }, []);

    const handlePinVerify = async () => {
        if (pin.length < 4) {
            setError("PIN must be at least 4 digits");
            return;
        }

        setError("");
        setLoading(true);

        const isValid = await verifyPin(pin);
        setLoading(false);

        if (isValid) {
            onUnlock();
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setPin("");

            if (newAttempts >= 5) {
                setError("Too many failed attempts. Logging out for security.");
                setTimeout(() => {
                    signOut();
                }, 2000);
            } else {
                setError(`Invalid PIN. ${5 - newAttempts} attempts remaining.`);
            }
        }
    };

    const handleBiometricVerify = async () => {
        setError("");
        setLoading(true);

        const isValid = await verifyBiometric();
        setLoading(false);

        if (isValid) {
            onUnlock();
        } else {
            setError("Biometric verification failed. Please try again or use PIN.");
            // Fallback to PIN
            setAuthType("pin");
        }
    };

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <div className="w-full max-w-md space-y-6 p-6">
                {/* Logo/Icon */}
                <div className="text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-primary/10 p-4">
                            <Lock className="h-12 w-12 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold">App Locked</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {authType === "biometric"
                            ? "Verify your identity to continue"
                            : "Enter your PIN to unlock"}
                    </p>
                </div>

                <form autoComplete="off" method="post" action="">
                    <input autoComplete="false" name="hidden" type="text" style={{ display: "none" }} />

                    <div className="space-y-4">
                        {/* PIN Input */}
                        {authType === "pin" && (
                            <div className="space-y-2">
                                <input
                                    name="pin-unlock-field"
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && pin.length >= 4) {
                                            handlePinVerify();
                                        }
                                    }}
                                    className="w-full rounded-md border border-input bg-background px-3 py-4 text-center text-3xl tracking-widest"
                                    placeholder="••••"
                                    autoComplete="one-time-code"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                    data-form-type="other"
                                    data-lpignore="true"
                                    data-1p-ignore="true"
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Biometric Button - NOT in a form */}
                        {authType === "biometric" && (
                            <button
                                type="button"
                                onClick={handleBiometricVerify}
                                disabled={loading}
                                className="w-full flex flex-col items-center justify-center gap-2 rounded-md border-2 border-primary bg-primary/10 px-4 py-8 text-primary hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Fingerprint className="h-12 w-12" />
                                <div className="font-medium">
                                    {loading ? "Verifying..." : "Tap to verify"}
                                </div>
                            </button>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
                                {error}
                            </div>
                        )}

                        {/* Unlock Button (for PIN) */}
                        {authType === "pin" && (
                            <button
                                type="button"
                                onClick={handlePinVerify}
                                disabled={loading || pin.length < 4}
                                className="w-full rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? "Verifying..." : "Unlock"}
                            </button>
                        )}

                        {/* Alternative Actions */}
                        <div className="space-y-2 pt-4">
                            {authType === "biometric" && (
                                <button
                                    type="button"
                                    onClick={() => setAuthType("pin")}
                                    className="w-full rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    Use PIN instead
                                </button>
                            )}

                            {authType === "pin" && biometricAvailable && (
                                <button
                                    type="button"
                                    onClick={() => setAuthType("biometric")}
                                    className="w-full flex items-center justify-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    <Fingerprint className="h-4 w-4" />
                                    Use Biometric
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm("Reset local authentication? You'll need to set up PIN again after login.")) {
                                        disableLocalAuth();
                                        handleLogout();
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 rounded-md border border-orange-200 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 dark:border-orange-900 dark:text-orange-400 dark:hover:bg-orange-950"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Reset PIN & Logout
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </form>

                <p className="text-center text-xs text-muted-foreground">
                    For security, the app locks when you leave and return.
                </p>
            </div>
        </div >
    );
}
