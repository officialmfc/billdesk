"use client";

import { useEffect, useState } from "react";

export function PWAStatus() {
    const [isInstalled, setIsInstalled] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [swRegistered, setSwRegistered] = useState(false);

    useEffect(() => {
        // Check if installed
        const installed = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
        setIsInstalled(installed);

        // Check online status
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(() => {
                setSwRegistered(true);
            });
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleManualInstall = () => {
        // Trigger the install prompt if available
        if ((window as any).showPWAInstallPrompt) {
            (window as any).showPWAInstallPrompt();
        } else {
            alert('Install prompt not available. Try:\n\n' +
                '1. Chrome: Menu → Install app\n' +
                '2. Safari: Share → Add to Home Screen\n' +
                '3. Edge: Menu → Apps → Install this site');
        }
    };

    return (
        <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-3 font-semibold">PWA Status</h3>
            <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Installed:</span>
                    <span className={isInstalled ? "text-green-600" : "text-yellow-600"}>
                        {isInstalled ? "✓ Yes" : "✗ No"}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Service Worker:</span>
                    <span className={swRegistered ? "text-green-600" : "text-yellow-600"}>
                        {swRegistered ? "✓ Active" : "✗ Not registered"}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Connection:</span>
                    <span className={isOnline ? "text-green-600" : "text-red-600"}>
                        {isOnline ? "✓ Online" : "✗ Offline"}
                    </span>
                </div>
            </div>

            {!isInstalled && (
                <button
                    onClick={handleManualInstall}
                    className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    Install App
                </button>
            )}

            <div className="mt-3 text-xs text-muted-foreground">
                {isInstalled ? (
                    <p>✓ App is installed and ready for offline use</p>
                ) : (
                    <p>Install the app for offline access and faster loading</p>
                )}
            </div>
        </div>
    );
}
