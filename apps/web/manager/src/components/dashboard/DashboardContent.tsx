'use client';

/**
 * Unified Dashboard Content
 * Responsive design that works on both mobile and desktop
 */

import { useDeviceType } from '@/hooks/useDeviceType';
import { DesktopDashboard } from './DesktopDashboard';
import { MobileDashboard } from './MobileDashboard';

export function DashboardContent(): React.ReactElement {
  const deviceType = useDeviceType();

  // For dashboard, we can still use device-specific components
  // since they have very different layouts
  // But they're now just CONTENT, not full pages with navigation
  return deviceType === 'mobile' ? <MobileDashboard /> : <DesktopDashboard />;
}
