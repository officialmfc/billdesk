/**
 * ErrorToast Component
 * Toast notifications for errors with auto-dismiss
 */

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

export interface ToastProps {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    onDismiss: (id: string) => void;
}

export function Toast({
    id,
    type,
    title,
    message,
    duration = 5000,
    onDismiss,
}: ToastProps): React.ReactElement {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleDismiss();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, id]);

    const handleDismiss = (): void => {
        setIsExiting(true);
        setTimeout(() => {
            onDismiss(id);
        }, 300);
    };

    const icons = {
        error: AlertCircle,
        success: CheckCircle,
        info: Info,
        warning: AlertTriangle,
    };

    const colors = {
        error: 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800',
        success: 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800',
        info: 'bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800',
        warning: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800',
    };

    const Icon = icons[type];

    return (
        <div
            className={`
                flex items-start gap-3 p-4 rounded-lg border shadow-lg
                ${colors[type]}
                ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
                min-w-[320px] max-w-md
            `}
            role="alert"
        >
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />

            <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{title}</div>
                {message && (
                    <div className="text-sm opacity-90 mt-1">{message}</div>
                )}
            </div>

            <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

/**
 * ToastContainer Component
 * Container for managing multiple toasts
 */
export interface ToastContainerProps {
    toasts: Omit<ToastProps, 'onDismiss'>[];
    onDismiss: (id: string) => void;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function ToastContainer({
    toasts,
    onDismiss,
    position = 'top-right',
}: ToastContainerProps): React.ReactElement {
    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
        'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    };

    return (
        <div
            className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-2 pointer-events-none`}
            aria-live="polite"
            aria-atomic="true"
        >
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast {...toast} onDismiss={onDismiss} />
                </div>
            ))}
        </div>
    );
}

/**
 * Hook for managing toasts
 */
export function useToasts() {
    const [toasts, setToasts] = useState<Omit<ToastProps, 'onDismiss'>[]>([]);

    const addToast = (toast: Omit<ToastProps, 'id' | 'onDismiss'>): string => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev, { ...toast, id }]);
        return id;
    };

    const dismissToast = (id: string): void => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const showError = (title: string, message?: string, duration?: number): string => {
        return addToast({ type: 'error', title, message, duration });
    };

    const showSuccess = (title: string, message?: string, duration?: number): string => {
        return addToast({ type: 'success', title, message, duration });
    };

    const showInfo = (title: string, message?: string, duration?: number): string => {
        return addToast({ type: 'info', title, message, duration });
    };

    const showWarning = (title: string, message?: string, duration?: number): string => {
        return addToast({ type: 'warning', title, message, duration });
    };

    return {
        toasts,
        addToast,
        dismissToast,
        showError,
        showSuccess,
        showInfo,
        showWarning,
    };
}
