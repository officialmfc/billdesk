"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SessionAwareSync } from "@/components/sync/SessionAwareSync";

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <ProtectedRoute>
      <SessionAwareSync>{children}</SessionAwareSync>
    </ProtectedRoute>
  );
}
