"use client";

import { useEffect, useState } from "react";
import { createSingleFlight } from "@mfc/auth";
import { createClient } from "@mfc/supabase-config";
import { useRouter } from "next/navigation";

const SESSION_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const SESSION_KEY = "mfc-session-timestamp";
const AUTH_BASE_URL =
    (process.env.NEXT_PUBLIC_AUTH_BASE_URL || "https://auth.mondalfishcenter.com").replace(/\/+$/, "");
const DEVICE_STORAGE_KEY = "mfc-manager-web-device-id";
const DEVICE_LABEL_KEY = "mfc-manager-web-device-label";

function getBrowserDeviceContext() {
    if (typeof window === "undefined") {
        return {
            deviceId: crypto.randomUUID(),
            deviceLabel: "browser web",
        };
    }

    let deviceId = window.localStorage.getItem(DEVICE_STORAGE_KEY);
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        window.localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
    }

    let deviceLabel = window.localStorage.getItem(DEVICE_LABEL_KEY);
    if (!deviceLabel) {
        const browserNavigator = navigator as Navigator & {
            userAgentData?: { platform?: string };
        };
        const platform =
            browserNavigator.userAgentData?.platform ||
            browserNavigator.platform ||
            "Browser";
        deviceLabel = `${platform} web`;
        window.localStorage.setItem(DEVICE_LABEL_KEY, deviceLabel);
    }

    return { deviceId, deviceLabel };
}

async function touchHostedWebDeviceLease(supabase: ReturnType<typeof createClient>) {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error("No authenticated session is available.");
    }

    const { deviceId, deviceLabel } = getBrowserDeviceContext();
    const response = await fetch(`${AUTH_BASE_URL}/api/devices/lease`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            app: "manager",
            platform: "web",
            deviceId,
            deviceLabel,
            mode: "touch",
        }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(payload.error || "This device is no longer active.");
        (error as Error & { deviceLease?: unknown }).deviceLease = payload;
        throw error;
    }
}

export function useSessionPersistence() {
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkSession = createSingleFlight(async () => {
            try {
                // Check if we're online
                const isOnline = navigator.onLine;

                // Check if session exists in localStorage (works offline)
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                // If offline and we have a session in storage, keep it valid
                if (!isOnline && session) {
                    console.log("📴 Offline mode - keeping session valid");
                    setIsSessionValid(true);
                    return;
                }

                if (error && !isOnline) {
                    // If offline and error, check if we have a stored session
                    const sessionTimestamp = localStorage.getItem(SESSION_KEY);
                    if (sessionTimestamp) {
                        const elapsed = Date.now() - parseInt(sessionTimestamp, 10);
                        if (elapsed < SESSION_DURATION) {
                            console.log("📴 Offline - using cached session");
                            setIsSessionValid(true);
                            return;
                        }
                    }
                }

                if (error) {
                    console.error("Session check error:", error);
                    setIsSessionValid(false);
                    return;
                }

                if (!session) {
                    console.log("No session found");
                    setIsSessionValid(false);
                    return;
                }

                // Check session timestamp
                const sessionTimestamp = localStorage.getItem(SESSION_KEY);
                const now = Date.now();

                if (sessionTimestamp) {
                    const elapsed = now - parseInt(sessionTimestamp, 10);

                    if (elapsed > SESSION_DURATION) {
                        console.log("Session expired (6 hours)");
                        if (isOnline) {
                            await supabase.auth.signOut();
                        }
                        localStorage.removeItem(SESSION_KEY);
                        setIsSessionValid(false);
                        router.push("/auth/login");
                        return;
                    }
                } else {
                    // Set timestamp if not exists
                    localStorage.setItem(SESSION_KEY, now.toString());
                }

                await touchHostedWebDeviceLease(supabase);
                setIsSessionValid(true);
            } catch (error) {
                console.error("Session validation error:", error);
                // If offline, don't invalidate session
                if (!navigator.onLine) {
                    const sessionTimestamp = localStorage.getItem(SESSION_KEY);
                    if (sessionTimestamp) {
                        const elapsed = Date.now() - parseInt(sessionTimestamp, 10);
                        if (elapsed < SESSION_DURATION) {
                            setIsSessionValid(true);
                            return;
                        }
                    }
                }
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : typeof error === "object" && error !== null && "message" in error
                            ? String((error as { message?: unknown }).message ?? "")
                            : String(error);
                const isLeaseError =
                    (error instanceof Error && "deviceLease" in error) ||
                    errorMessage.includes("no longer active") ||
                    errorMessage.includes("device lease");
                if (navigator.onLine && isLeaseError) {
                    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
                    localStorage.removeItem(SESSION_KEY);
                    router.push("/auth/login");
                }
                setIsSessionValid(false);
            }
        });

        void checkSession();

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth state changed:", event);

            if (event === "SIGNED_IN" && session) {
                // Update session timestamp on sign in
                localStorage.setItem(SESSION_KEY, Date.now().toString());
                setIsSessionValid(true);
            } else if (event === "SIGNED_OUT") {
                localStorage.removeItem(SESSION_KEY);
                setIsSessionValid(false);
                router.push("/auth/login");
            } else if (event === "TOKEN_REFRESHED") {
                // Update timestamp on token refresh
                localStorage.setItem(SESSION_KEY, Date.now().toString());
                console.log("Token refreshed, session extended");
            }
        });

        // Listen for online/offline events
        const handleOnline = () => {
            console.log("🌐 Back online - checking session");
            void checkSession();
        };

        const handleOffline = () => {
            console.log("📴 Gone offline - keeping session valid");
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Check session validity periodically (every 5 minutes) - only when online
        const interval = setInterval(() => {
            if (navigator.onLine) {
                void checkSession();
            }
        }, 5 * 60 * 1000);

        return () => {
            subscription.unsubscribe();
            clearInterval(interval);
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [supabase, router]);

    return { isSessionValid };
}
