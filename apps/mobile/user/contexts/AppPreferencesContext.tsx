import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

type AppPreferencesValue = {
  isLoading: boolean;
  sellerSectionEnabled: boolean;
  setSellerSectionEnabled: (value: boolean) => Promise<void>;
};

const STORAGE_KEY = "user_mobile_seller_section_enabled";

const AppPreferencesContext = createContext<AppPreferencesValue | undefined>(undefined);

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [sellerSectionEnabled, setSellerSectionEnabledState] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const value = await SecureStore.getItemAsync(STORAGE_KEY);
        setSellerSectionEnabledState(value === "true");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setSellerSectionEnabled = async (value: boolean) => {
    setSellerSectionEnabledState(value);
    await SecureStore.setItemAsync(STORAGE_KEY, value ? "true" : "false");
  };

  return (
    <AppPreferencesContext.Provider
      value={{
        isLoading,
        sellerSectionEnabled,
        setSellerSectionEnabled,
      }}
    >
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);
  if (!context) {
    throw new Error("useAppPreferences must be used within an AppPreferencesProvider");
  }
  return context;
}
