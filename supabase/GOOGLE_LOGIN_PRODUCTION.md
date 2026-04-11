# Google Login In Production

This project now uses Google OAuth across:

- web manager
- mobile manager
- mobile admin
- mobile user
- desktop manager

This document is the production checklist for Supabase Auth, Google Cloud, and app redirect URLs.

## 1. Google Cloud Setup

Create OAuth credentials in Google Cloud Console:

1. Open `APIs & Services -> Credentials`
2. Create an `OAuth client ID`
3. Add the required authorized redirect URIs from the Supabase project
4. Add your production web origin if you use Google directly on web pages

For Supabase-managed OAuth, the main Google redirect usually looks like:

```text
https://<your-project-ref>.supabase.co/auth/v1/callback
```

Use your real project ref.

## 2. Supabase Auth Provider Setup

In Supabase:

1. Open `Authentication -> Providers -> Google`
2. Enable Google
3. Paste the Google client id and secret
4. Save

Then open:

`Authentication -> URL Configuration`

Set:

- `Site URL`
- `Redirect URLs`

## 3. Redirect URLs To Allow In Supabase

Add every production callback you actually use.

### Web manager

```text
https://manager.yourdomain.com/auth/callback
```

The current web manager code uses:

```text
${window.location.origin}/auth/callback
```

So the real production domain must be allowed.

### Mobile manager

```text
mfcmanager://oauth-callback
```

### Mobile admin

```text
mfcadmin://oauth-callback
```

### Mobile user

```text
mfcuser://oauth-callback
```

### Desktop manager

Desktop manager uses `MANAGER_OAUTH_REDIRECT_URL`.

Recommended production value:

```text
https://manager.yourdomain.com/auth/desktop-callback
```

The Electron popup watches for that final URL and completes the session exchange locally.

You can also use another dedicated HTTPS callback page, but it must:

- be allowlisted in Supabase redirect URLs
- exactly match `MANAGER_OAUTH_REDIRECT_URL`

## 4. Required App Environment Values

### Web manager

Make sure production has:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Mobile apps

Make sure Expo production config resolves:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

or the fallback names currently accepted by the apps:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Desktop manager

Set:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
MANAGER_OAUTH_REDIRECT_URL
```

## 5. Deep Linking For Mobile

Each mobile app must keep its scheme stable in production.

Current schemes:

- manager: `mfcmanager`
- admin: `mfcadmin`
- user: `mfcuser`

If you change a scheme:

- update the mobile app config
- update the Supabase redirect URL allowlist
- update any documentation or QA scripts

## 6. Desktop Callback Page

For desktop production, create a tiny hosted callback page such as:

```text
https://manager.yourdomain.com/auth/desktop-callback
```

That page does not need custom logic for the current Electron flow. It only needs to load successfully so the popup reaches the configured redirect URL with OAuth params.

Keep it lightweight and public.

## 7. Common Production Failures

### Google login opens but never returns

Usually one of:

- redirect URL not allowlisted in Supabase
- wrong app scheme on mobile
- wrong `MANAGER_OAUTH_REDIRECT_URL` on desktop

### Login returns but session is missing

Check:

- Supabase provider enabled
- Google client id/secret are correct
- app is using the right Supabase project

### Mobile app opens browser but not app

Check:

- Expo/Android/iOS scheme registration
- redirect URI exactly matches the app scheme callback

### Desktop popup closes with failure

Check:

- the final popup URL starts with `MANAGER_OAUTH_REDIRECT_URL`
- the callback URL is reachable in production
- the callback URL is in Supabase redirect URLs

## 8. Recommended Production Redirect List Example

```text
https://manager.yourdomain.com/auth/callback
https://manager.yourdomain.com/auth/desktop-callback
mfcmanager://oauth-callback
mfcadmin://oauth-callback
mfcuser://oauth-callback
```

## 9. Deployment Reminder

After changing any redirect URL:

1. update Supabase allowlist
2. update app env values
3. rebuild mobile/desktop apps
4. retest Google login on every platform