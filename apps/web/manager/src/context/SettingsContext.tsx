// context/SettingsContext.tsx
'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';

type SyncMode = 'auto' | 'manual';

interface SettingsContextType {
  syncMode: SyncMode;
  setSyncMode: (mode: SyncMode) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

import { storageKeys } from '@/config/storage';

const SETTINGS_KEY = storageKeys.settings;

interface SettingsProviderProps {
  children: ReactNode;
}

// Helper to load settings from localStorage
const loadSettings = (): { syncMode: SyncMode } => {
  if (typeof window === 'undefined') {
    return { syncMode: 'auto' }; // Default server-side
  }
  try {
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      // Validate the loaded mode
      if (parsed.syncMode === 'auto' || parsed.syncMode === 'manual') {
        return { syncMode: parsed.syncMode };
      }
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage:", error);
  }
  return { syncMode: 'auto' }; // Default if nothing stored or invalid
};

export function SettingsContextProvider({ children }: SettingsProviderProps): React.JSX.Element {
  const [syncMode, setSyncModeState] = useState<SyncMode>(() => loadSettings().syncMode);

  // Update localStorage whenever the setting changes
  useEffect(() => {
    try {
      const settingsToSave = JSON.stringify({ syncMode });
      localStorage.setItem(SETTINGS_KEY, settingsToSave);
      console.log("Settings saved:", settingsToSave);
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }, [syncMode]);

  const setSyncMode = useCallback((mode: SyncMode) => {
    if (mode === 'auto' || mode === 'manual') {
      setSyncModeState(mode);
    }
  }, []);

  const value = {
    syncMode,
    setSyncMode,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// Custom hook to use the Settings Context
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsContextProvider');
  }
  return context;
};