import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getManagerSaleFlowDefinition } from "@mfc/manager-ui";

const LANDING_PREFERENCE_KEY = "manager_mobile_default_landing";
export const DEFAULT_MOBILE_LANDING = "/ledgers/customers/day";

export const MOBILE_LANDING_OPTIONS = [
  { value: DEFAULT_MOBILE_LANDING, label: "Customer Ledger Day" },
  { value: "/ledgers/sellers/day", label: "Seller Ledger Day" },
  { value: "/dashboard", label: "Dashboard" },
  {
    value: getManagerSaleFlowDefinition("auction").mobileHref,
    label: getManagerSaleFlowDefinition("auction").entryTitle,
  },
  {
    value: getManagerSaleFlowDefinition("batch").mobileHref,
    label: getManagerSaleFlowDefinition("batch").entryTitle,
  },
  { value: "/payments", label: "Payments" },
  { value: "/more/products", label: "Products" },
  { value: "/more/stock", label: "Stock" },
] as const;

async function getWebValue(): Promise<string | null> {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage.getItem(LANDING_PREFERENCE_KEY);
}

async function setWebValue(value: string): Promise<void> {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(LANDING_PREFERENCE_KEY, value);
}

export async function getMobileLandingPreference(): Promise<string> {
  if (Platform.OS === "web") {
    return (await getWebValue()) || DEFAULT_MOBILE_LANDING;
  }

  return (await SecureStore.getItemAsync(LANDING_PREFERENCE_KEY)) || DEFAULT_MOBILE_LANDING;
}

export async function setMobileLandingPreference(path: string): Promise<void> {
  if (Platform.OS === "web") {
    await setWebValue(path);
    return;
  }

  await SecureStore.setItemAsync(LANDING_PREFERENCE_KEY, path);
}

export async function resetMobileLandingPreference(): Promise<void> {
  await setMobileLandingPreference(DEFAULT_MOBILE_LANDING);
}
