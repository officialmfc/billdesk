# @mfc/auth

Authentication package with offline session support for MFC BillDesk.

## Overview

This package provides:

* React context for authentication state
* Supabase authentication session management
* Offline session caching using sessionStorage
* Role-based access control
* Profile validation

## Usage

### React Context

```typescript
import { AuthProvider, useAuth } from "@mfc/auth";
import { createClient, authConfig } from "@mfc/supabase-config";

// In your app root
function App() {
  const supabase = createClient();

  return (
    <AuthProvider
      config={{
        supabaseClient: supabase,
        authConfig: authConfig,
        onAuthError: (error) => console.error("Auth error:", error),
        onUnauthorized: () => console.warn("Unauthorized access"),
      }}
    >
      <YourApp />
    </AuthProvider>
  );
}

// In your components
function MyComponent() {
  const { user, profile, isLoading, isOfflineSession, signOut } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>User: {profile?.display_name}</p>
      <p>Role: {profile?.user_role}</p>
      <p>Offline: {isOfflineSession ? "Yes" : "No"}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Utility Functions

```typescript
import { cacheProfile, loadCachedProfile, validateProfile } from "@mfc/auth";

// Cache profile
cacheProfile(userProfile, "my_cache_key");

// Load cached profile
const cached = loadCachedProfile("my_cache_key");

// Validate profile
const isValid = validateProfile(userProfile, ["admin", "selladmin"]);
```

## Features

### Offline Session Support

Caches minimal profile data in sessionStorage for offline access. Cache expires after 1 hour or when browser/tab closes.

### Role-Based Access Control

Validates user roles against allowed roles list. Automatically signs out unauthorized users.

### Profile Validation

Checks user active status and role before granting access.

### Secure Caching

Uses sessionStorage (not localStorage) for better security. Only caches non-sensitive data (display name, role).

## Auth Flow


1. **Initial Load**: Check for active session
2. **Session Found**: Fetch profile from Supabase
3. **Profile Validation**: Check active status and role
4. **Cache Profile**: Store minimal data in sessionStorage
5. **No Session**: Try to load from cache (offline mode)

## Dependencies

* `@mfc/types` - Shared type definitions
* `@supabase/supabase-js` - Supabase client
* `next` - Next.js framework (peer dependency)
* `react` - React library (peer dependency)


