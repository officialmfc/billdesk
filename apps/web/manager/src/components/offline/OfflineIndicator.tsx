"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

export function OfflineIndicator(): React.JSX.Element | null {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground px-4 py-2 z-50 flex items-center justify-center gap-2 text-sm font-medium">
      <WifiOff className="w-4 h-4" />
      <span>
        You are offline - Forms are disabled until connection is restored
      </span>
    </div>
  );
}
