"use client";

import { isLocalAuthEnabled } from "@/lib/local-auth";
import { logger } from "@/lib/logger";
import { useAuth } from "@mfc/auth";
import React from 'react';
import { LocalAuthLock } from "./LocalAuthLock";
import { LocalAuthSetup } from "./LocalAuthSetup";

interface LocalAuthContextType {
    isLocked: boolean;
    unlock: () => void;
    lock: () => void;
}

const LocalAuthContext = React.createContext<LocalAuthContextType | undefined>(undefined);

export function useLocalAuth() {
    const context = React.useContext(LocalAuthContext);
    if (!context) {
        throw new Error("useLocalAuth must be used within LocalAuthProvider");
    }
    return context;
}

interface LocalAuthProviderProps {
    children: React.ReactNode;
}

export function LocalAuthProvider({ children }: LocalAuthProviderProps): React.ReactElement | null {
    const { user, profile, loading: authLoading } = useAuth();
    const [isLocked, setIsLocked] = React.useState(false);
    const [showSetup, setShowSetup] = React.useState(false);
    const [setupSkipped, setSetupSkipped] = React.useState(false);

    // Check if we should show setup on first login
    React.useEffect(() => {
        if (!authLoading && user && profile) {
            const authEnabled = isLocalAuthEnabled();
            const hasSkipped = localStorage.getItem("local_auth_setup_skipped") === "true";

            // TEMPORARY: Disable lock for testing
            if (true) return;

            logger.info({
                authEnabled,
                hasSkipped,
                setupSkipped,
                showSetup,
                isLocked
            });

            if (!authEnabled && !hasSkipped && !setupSkipped) {
                // First time login - show setup
                logger.info('🔐 Showing setup modal');
                setShowSetup(true);
            } else if (authEnabled) {
                // Auth is enabled - lock the app
                console.debug('🔐 Locking app');
                setIsLocked(true);
            } else {
                console.debug('🔐 No auth required');
            }
        }
    }, [user, profile, authLoading, setupSkipped]);

    // Lock app when page visibility changes (user switches tabs/apps)
    React.useEffect(() => {
        if (!user || !profile) return;

        const authEnabled = isLocalAuthEnabled();
        // TEMPORARY: Disable lock for testing
        if (!authEnabled || true) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                // User left the app - lock it
                console.debug("🔒 App hidden - locking");
            } else {
                // User returned - lock the app
                console.debug("🔒 App visible again - requiring auth");
                setIsLocked(true);
            }
        };

        const handlePageHide = () => {
            console.debug("🔒 Page hide - locking");
            setIsLocked(true);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("pagehide", handlePageHide);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("pagehide", handlePageHide);
        };
    }, [user, profile]);

    // Lock app on focus loss (for desktop)
    React.useEffect(() => {
        if (!user || !profile) return;

        const authEnabled = isLocalAuthEnabled();
        // TEMPORARY: Disable lock for testing as requested
        if (!authEnabled || true) return;

        const handleBlur = () => {
            // Lock after a delay to avoid locking during normal interactions
            const lockTimer = setTimeout(() => {
                if (!document.hasFocus()) {
                    console.debug("🔒 Window lost focus - locking");
                    setIsLocked(true);
                }
            }, 5000); // 5 second delay

            return () => clearTimeout(lockTimer);
        };

        window.addEventListener("blur", handleBlur);

        return () => {
            window.removeEventListener("blur", handleBlur);
        };
    }, [user, profile]);

    const unlock = () => {
        console.debug("🔓 App unlocked");
        setIsLocked(false);
    };

    const lock = () => {
        console.debug("🔒 App locked manually");
        setIsLocked(true);
    };

    const handleSetupComplete = () => {
        console.debug("✅ Local auth setup complete");
        setShowSetup(false);
        setIsLocked(false);
    };

    const handleSetupSkip = () => {
        console.debug("⏭️  Local auth setup skipped");
        localStorage.setItem("local_auth_setup_skipped", "true");
        setShowSetup(false);
        setSetupSkipped(true);
    };

    // Don't show anything while auth is loading
    if (authLoading) {
        return <></>;
    }

    // Show setup screen if needed
    if (showSetup && user && profile) {
        return (
            <div>
                <LocalAuthSetup
                    userId={user.id}
                    onComplete={handleSetupComplete}
                />
                <button
                    onClick={handleSetupSkip}
                    className="fixed bottom-4 right-4 z-[60] rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                    Skip for now
                </button>
            </div>
        );
    }

    // Show lock screen if locked
    if (isLocked && user && profile) {
        return <LocalAuthLock onUnlock={unlock} />;
    }

    return (
        <LocalAuthContext.Provider value={{ isLocked, unlock, lock }}>
            {children}
        </LocalAuthContext.Provider>
    );
}
