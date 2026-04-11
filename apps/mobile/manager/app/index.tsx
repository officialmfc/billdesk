import { Redirect } from 'expo-router';

export default function Index() {
  // Root index redirects to auth or tabs based on auth state
  // The actual routing is handled in _layout.tsx
  return <Redirect href="/(auth)/login" />;
}
