/**
 * Toast Notification System
 * 
 * A toast notification component with support for different types and auto-dismiss.
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { clsx } from 'clsx';

// ============================================================================
// TYPES
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export interface ToastContextValue {
    toasts: Toast[];
    showToast: (toast: Omit<Toast, 'id'>) => void;
    hideToast: (id: string) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const hideToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: Toast = { ...toast, id };

        setToasts(prev => [...prev, newToast]);

        // Auto-dismiss after duration
        const duration = toast.duration ?? 3000;
        if (duration > 0) {
            setTimeout(() => hideToast(id), duration);
        }
    }, [hideToast]);

    const success = useCallback((message: string, duration?: number) => {
        showToast({ type: 'success', message, duration });
    }, [showToast]);

    const error = useCallback((message: string, duration?: number) => {
        showToast({ type: 'error', message, duration });
    }, [showToast]);

    const warning = useCallback((message: string, duration?: number) => {
        showToast({ type: 'warning', message, duration });
    }, [showToast]);

    const info = useCallback((message: string, duration?: number) => {
        showToast({ type: 'info', message, duration });
    }, [showToast]);

    const value: ToastContextValue = {
        toasts,
        showToast,
        hideToast,
        success,
        error,
        warning,
        info,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={hideToast} />
        </ToastContext.Provider>
    );
}

// ============================================================================
// TOAST CONTAINER
// ============================================================================

interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="mfc-toast-container" aria-live="polite" aria-atomic="true">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}

// ============================================================================
// TOAST ITEM
// ============================================================================

interface ToastItemProps {
    toast: Toast;
    onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    return (
        <div
            className={clsx('mfc-toast', `mfc-toast--${toast.type}`)}
            role="alert"
        >
            <div className="mfc-toast-content">
                <div className="mfc-toast-message">{toast.message}</div>
                {toast.action && (
                    <button
                        type="button"
                        onClick={toast.action.onClick}
                        className="mfc-toast-action"
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>
            <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="mfc-toast-close"
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
}
