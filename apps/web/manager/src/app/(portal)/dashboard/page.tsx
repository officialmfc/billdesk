'use client';

/**
 * Dashboard Page
 * Uses unified layout system - navigation is handled by portal layout
 * Content adapts to device size using responsive design
 */

import dynamic from 'next/dynamic';
import { PageContainer } from "@/components/layouts/PageContainer";

// Dynamic import for dashboard content (can still be device-specific if needed)
const DashboardContent = dynamic(
  () =>
    import("@/components/dashboard/DashboardContent").then((mod) => ({
      default: mod.DashboardContent,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    ),
  }
);

export default function DashboardPage(): React.ReactElement {
  return (
    <PageContainer maxWidth="full">
      <DashboardContent />
    </PageContainer>
  );
}
