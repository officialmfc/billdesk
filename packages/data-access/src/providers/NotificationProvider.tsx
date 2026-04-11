/**
 * NotificationProvider
 * Centralized notification/toast management
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export interface NotificationContextValue {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => string;
    removeNotification: (id: string) => void;
    clearAll: () => void;
    success: (title: string, message?: string, duration?: number) => string;
    error: (title: string, message?: string, duration?: number) => string;
    warning: (title: string, message?: string, duration?: number) => string;
    info: (title: string, message?: string, duration?: number) => string;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export interface NotificationProviderProps {
    children: React.ReactNode;
    maxNotifications?: number;
}

export function NotificationProvider({
    children,
    maxNotifications = 5
}: NotificationProviderProps): React.ReactElement {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((notification: Omit<Notification, 'id'>): string => {
        const id = `notification-${Date.now()}-${Math.random()}`;
        const newNotification: Notification = {
            ...notification,
            id,
            duration: notification.duration ?? 5000,
        };

        setNotifications(prev => {
            const updated = [...prev, newNotification];
            // Keep only the most recent notifications
            if (updated.length > maxNotifications) {
                return updated.slice(-maxNotifications);
            }
            return updated;
        });

        // Auto-remove after duration
        if (newNotification.duration && newNotification.duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        }

        return id;
    }, [maxNotifications]);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const success = useCallback((title: string, message?: string, duration?: number): string => {
        return addNotification({ type: 'success', title, message, duration });
    }, [addNotification]);

    const error = useCallback((title: string, message?: string, duration?: number): string => {
        return addNotification({ type: 'error', title, message, duration });
    }, [addNotification]);

    const warning = useCallback((title: string, message?: string, duration?: number): string => {
        return addNotification({ type: 'warning', title, message, duration });
    }, [addNotification]);

    const info = useCallback((title: string, message?: string, duration?: number): string => {
        return addNotification({ type: 'info', title, message, duration });
    }, [addNotification]);

    const value = useMemo<NotificationContextValue>(
        () => ({
            notifications,
            addNotification,
            removeNotification,
            clearAll,
            success,
            error,
            warning,
            info,
        }),
        [notifications, addNotification, removeNotification, clearAll, success, error, warning, info]
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications(): NotificationContextValue {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
}

/**
 * Simplified hook for common notification actions
 */
export function useNotify() {
    const { success, error, warning, info } = useNotifications();
    return { success, error, warning, info };
}
