// Service Worker Registration
// Registers the service worker for offline support

import { logger } from './logger';

export function registerServiceWorker(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        logger.info('[SW] Service workers not supported');
        return;
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                logger.info('[SW] Service worker registered: ' + registration.scope);

                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000); // Check every hour

                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            logger.info('[SW] New version available');

                            // Optionally show update notification to user
                            if (confirm('A new version is available. Reload to update?')) {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch((error) => {
                logger.error(error, '[SW] Service worker registration failed');
            });

        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            logger.info('[SW] Controller changed - reloading');
            window.location.reload();
        });
    });
}

// Check if app is running as PWA
export function isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
}

// Prompt user to install PWA
export function promptPWAInstall(): void {
    let deferredPrompt: any;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // Show install button or prompt
        console.log('[PWA] Install prompt available');

        // You can trigger this later with a button click
        (window as any).showPWAInstallPrompt = () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult: any) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('[PWA] User accepted install');
                    }
                    deferredPrompt = null;
                });
            }
        };
    });
}
