import { OfflineWarning } from '@/components/sales/offline-warning';
import type { ReactNode } from 'react';

/**
 * Sales Layout
 * Includes offline warning banner below navbar
 */

export default function SalesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <OfflineWarning />
      {children}
    </>
  );
}
