"use client";

/**
 * Portal Layout with Device-Specific Bundle Optimization
 * Loads only mobile OR desktop components, not both
 * Wraps everything with SessionAwareSync to ensure session is verified before sync
 */

import dynamic from "next/dynamic";
import { useDeviceType } from "@/hooks/useDeviceType";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SessionAwareSync } from "@/components/sync/SessionAwareSync";

// Dynamic imports for device-specific layouts
const DesktopPortalLayout = dynamic(
  () =>
    import("@/components/layouts/DesktopPortalLayout").then((mod) => ({
      default: mod.DesktopPortalLayout,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    ),
  }
);

const MobilePortalLayout = dynamic(
  () =>
    import("@/components/layouts/MobilePortalLayout").then((mod) => ({
      default: mod.MobilePortalLayout,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    ),
  }
);

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const deviceType = useDeviceType();

  return (
    <ProtectedRoute>
      <SessionAwareSync>
        {deviceType === "mobile" ? (
          <MobilePortalLayout>{children}</MobilePortalLayout>
        ) : (
          <DesktopPortalLayout>{children}</DesktopPortalLayout>
        )}
      </SessionAwareSync>
    </ProtectedRoute>
  );
}
