"use client";

import { logger } from "@/lib/logger";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallButton, setShowInstallButton] = useState(false);

    useEffect(() => {
        // Check if already installed
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        if (isInstalled) {
            logger.info('[PWA] Already installed');
            return;
        }

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            const promptEvent = e as BeforeInstallPromptEvent;
            setDeferredPrompt(promptEvent);
            setShowInstallButton(true);
            logger.info('[PWA] Install prompt available');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            logger.info('[PWA] App installed successfully');
            setShowInstallButton(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            logger.info('[PWA] No install prompt available');
            return;
        }

        // Show the install prompt
        await deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;
        logger.info(`[PWA] User ${outcome} the install prompt`);

        if (outcome === 'accepted') {
            setShowInstallButton(false);
        }

        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowInstallButton(false);
        // Store dismissal in localStorage to not show again for a while
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    if (!showInstallButton) {
        return null;
    }

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom md:bottom-4">
            <div className="rounded-lg border bg-card p-4 shadow-lg">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-2xl">📱</div>
                    <div className="flex-1">
                        <h3 className="font-semibold">Install MFC Manager</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Install the app for faster access and offline support
                        </p>
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={handleInstallClick}
                                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Install
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
                            >
                                Not now
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}
