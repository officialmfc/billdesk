'use client';

import { AuthProvider } from '@mfc/auth';
import { createClient } from '@/lib/supabase/client';

export function AuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const supabase = createClient();

  return (
    <AuthProvider supabase={supabase}>
      {children}
    </AuthProvider>
  );
}
