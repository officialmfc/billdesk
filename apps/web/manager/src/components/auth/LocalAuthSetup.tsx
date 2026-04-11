"use client";

import {
    isBiometricAvailable,
    setupBiometricAuth,
    setupPinAuth,
} from "@/lib/local-auth";
import { CheckCircle2, Fingerprint } from "lucide-react";
import { useEffect, useState } from "react";

interface LocalAuthSetupProps {
    userId: string;
    onComplete: () => void;
}

export function LocalAuthSetup({ userId, onComplete }: LocalAuthSetupProps): React.JSX.Element {
    const [step, setStep] = useState<"pin" | "biometric">("pin");
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);

    useEffect(() => {
        console.log('🔐 LocalAuthSetup is mounted and showing');
    }, []);

    useEffect(() => {
        checkBiometricAvailability();
    }, []);

    const checkBiometricAvailability = async () => {
        const available = await isBiometricAvailable();
        setBiometricAvailable(available);
    };

    const handlePinSetup = async () => {
        setError("");

        if (pin.length < 4) {
            setError("PIN must be at least 4 digits");
            return;
        }

        if (pin !== confirmPin) {
            setError("PINs do not match");
            return;
        }

        setLoading(true);
        const success = await setupPinAuth(pin);
        setLoading(false);

        if (success) {
            // PIN setup complete - ask about biometric if available
            if (biometricAvailable) {
                setStep("biometric");
            } else {
                onComplete();
            }
        } else {
            setError("Failed to setup PIN. Please try again.");
        }
    };

    const handleBiometricSetup = async () => {
        setError("");
        setLoading(true);

        const success = await setupBiometricAuth(userId);
        setLoading(false);

        if (success) {
            onComplete();
        } else {
            setError("Failed to setup biometric. You can continue with PIN only.");
        }
    };

    const handleSkipBiometric = () => {
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
                {step === "pin" ? (
                    <>
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold">Setup Security PIN</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Create a PIN to secure your app. This is required for security.
                            </p>
                        </div>

                        <form autoComplete="off" method="post" action="">
                            <input autoComplete="false" name="hidden" type="text" style={{ display: "none" }} />

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="pin" className="text-sm font-medium">
                                        Enter PIN (4-6 digits)
                                    </label>
                                    <input
                                        id="pin"
                                        name="pin-setup-field"
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-2xl tracking-widest"
                                        placeholder="••••"
                                        autoComplete="new-password"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck="false"
                                        data-form-type="other"
                                        data-lpignore="true"
                                        data-1p-ignore="true"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="confirmPin" className="text-sm font-medium">
                                        Confirm PIN
                                    </label>
                                    <input
                                        id="confirmPin"
                                        name="pin-confirm-field"
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        value={confirmPin}
                                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-2xl tracking-widest"
                                        placeholder="••••"
                                        autoComplete="new-password"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck="false"
                                        data-form-type="other"
                                        data-lpignore="true"
                                        data-1p-ignore="true"
                                    />
                                </div>

                                {error && (
                                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={handlePinSetup}
                                    disabled={loading || !pin || !confirmPin}
                                    className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loading ? "Setting up..." : "Continue"}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold">Add Biometric?</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Use fingerprint or face recognition for faster unlock. You can always use your PIN.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <p className="text-sm text-blue-900 dark:text-blue-100">
                                        PIN setup complete! You can now add biometric authentication for convenience.
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleBiometricSetup}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Fingerprint className="h-4 w-4" />
                                    {loading ? "Setting up..." : "Setup Biometric"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSkipBiometric}
                                    className="rounded-md border border-input px-4 py-2 font-medium hover:bg-accent"
                                >
                                    Skip
                                </button>
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                You can enable biometric later in Settings
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
