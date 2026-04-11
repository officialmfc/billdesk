/**
 * AppStateProvider
 * Global application state management
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface AppState {
    isOnline: boolean;
    isSyncing: boolean;
    lastSyncTime: Date | null;
    pendingChanges: number;
    user: {
        id: string;
        name: string;
        role: string;
    } | null;
}

export interface AppStateContextValue {
    state: AppState;
    setOnline: (isOnline: boolean) => void;
    setSyncing: (isSyncing: boolean) => void;
    setLastSyncTime: (time: Date) => void;
    setPendingChanges: (count: number) => void;
    setUser: (user: AppState['user']) => void;
    clearUser: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export interface AppStateProviderProps {
    children: React.ReactNode;
    initialState?: Partial<AppState>;
}

export function AppStateProvider({ children, initialState }: AppStateProviderProps): React.ReactElement {
    const [state, setState] = useState<AppState>({
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        isSyncing: false,
        lastSyncTime: null,
        pendingChanges: 0,
        user: null,
        ...initialState,
    });

    const setOnline = useCallback((isOnline: boolean) => {
        setState(prev => ({ ...prev, isOnline }));
    }, []);

    const setSyncing = useCallback((isSyncing: boolean) => {
        setState(prev => ({ ...prev, isSyncing }));
    }, []);

    const setLastSyncTime = useCallback((time: Date) => {
        setState(prev => ({ ...prev, lastSyncTime: time }));
    }, []);

    const setPendingChanges = useCallback((count: number) => {
        setState(prev => ({ ...prev, pendingChanges: count }));
    }, []);

    const setUser = useCallback((user: AppState['user']) => {
        setState(prev => ({ ...prev, user }));
    }, []);

    const clearUser = useCallback(() => {
        setState(prev => ({ ...prev, user: null }));
    }, []);

    const value = useMemo<AppStateContextValue>(
        () => ({
            state,
            setOnline,
            setSyncing,
            setLastSyncTime,
            setPendingChanges,
            setUser,
            clearUser,
        }),
        [state, setOnline, setSyncing, setLastSyncTime, setPendingChanges, setUser, clearUser]
    );

    return (
        <AppStateContext.Provider value={value}>
            {children}
        </AppStateContext.Provider>
    );
}

export function useAppState(): AppStateContextValue {
    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error('useAppState must be used within AppStateProvider');
    }
    return context;
}

/**
 * Selector hooks for optimized re-renders
 */
export function useIsOnline(): boolean {
    const { state } = useAppState();
    return state.isOnline;
}

export function useIsSyncing(): boolean {
    const { state } = useAppState();
    return state.isSyncing;
}

export function usePendingChanges(): number {
    const { state } = useAppState();
    return state.pendingChanges;
}

export function useCurrentUser(): AppState['user'] {
    const { state } = useAppState();
    return state.user;
}
