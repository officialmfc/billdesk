"use client";

import { usePathname } from "next/navigation";
import { WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OfflineFormWarningProps {
  isOnline: boolean;
}

export function OfflineFormWarning({ isOnline }: OfflineFormWarningProps): React.JSX.Element | null {
  const pathname = usePathname();

  // Only show on form pages (routes ending with /new)
  const isFormPage = pathname?.endsWith("/new");

  if (isOnline || !isFormPage) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        You are offline. Changes will be saved locally and synced when you're
        back online.
      </AlertDescription>
    </Alert>
  );
}
