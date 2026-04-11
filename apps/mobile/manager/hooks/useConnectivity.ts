import { useMemo } from "react";
import { useNetInfo } from "@react-native-community/netinfo";

export function useConnectivity() {
  const netInfo = useNetInfo();

  return useMemo(
    () => ({
      isOnline: Boolean(netInfo.isConnected && netInfo.isInternetReachable !== false),
      isConnected: Boolean(netInfo.isConnected),
      details: netInfo.details,
      type: netInfo.type,
    }),
    [netInfo.details, netInfo.isConnected, netInfo.isInternetReachable, netInfo.type]
  );
}

