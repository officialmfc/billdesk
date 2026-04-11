# Login Not Working - Diagnostic & Fix Guide

## Problem
**Apps don't receive session after redirect** - Authentication succeeds in the auth hub, but mobile/desktop/web apps don't receive the session.

---

## Root Causes & Fixes

### ✅ FIX 1: Verify Supabase Redirect URLs Are Allowlisted

**Action Required**: Go to your Supabase Dashboard → Authentication → URL Configuration

Add these **exact** redirect URLs:

```
https://manager.bill.mondalfishcenter.com/auth/callback
https://manager.bill.mondalfishcenter.com/auth/desktop-callback
mfcmanager://oauth-callback
mfcadmin://oauth-callback
mfcuser://oauth-callback
```

**Why**: Supabase will reject OAuth callbacks to URLs not in this allowlist.

---

### ✅ FIX 2: Mobile Apps - Check Deep Linking Configuration

**Current Status**: Your mobile apps have correct schemes configured:
- Manager: `mfcmanager` ✅
- Admin: `mfcadmin` ✅  
- User: `mfcuser` ✅

**Test Deep Linking**:

Run this command while the app is running on your device:

```bash
# For manager mobile
xcrun simctl openurl booted "mfcmanager://oauth-callback?access_token=test&refresh_token=test"

# For admin mobile
xcrun simctl openurl booted "mfcadmin://oauth-callback?access_token=test&refresh_token=test"

# For user mobile
xcrun simctl openurl booted "mfcuser://oauth-callback?access_token=test&refresh_token=test"
```

If the app doesn't open, the deep linking is not configured correctly.

**Android Testing**:
```bash
adb shell am start -W -a android.intent.action.VIEW -d "mfcmanager://oauth-callback?access_token=test&refresh_token=test" com.mfc.manager
```

---

### ✅ FIX 3: Desktop App - Create Hosted Callback Page

**Problem**: Desktop app uses `mfcmanager://oauth-callback` directly, but browser OAuth needs an HTTPS intermediary.

**Solution**: The web manager already has `/auth/desktop-callback` page. Update your `.env`:

```env
# For desktop manager
MANAGER_OAUTH_REDIRECT_URL=https://manager.bill.mondalfishcenter.com/auth/desktop-callback
```

**How it works**:
1. Desktop app opens browser to auth hub
2. After Google/password auth, Supabase redirects to `https://manager.bill.mondalfishcenter.com/auth/desktop-callback`
3. That page redirects to `mfcmanager://oauth-callback` with tokens
4. Desktop app receives the custom protocol URL and completes login

**Test**: Open this URL in your browser while desktop app is running:
```
mfcmanager://oauth-callback?access_token=test&refresh_token=test
```

The desktop app should receive it via the `open-url` event handler.

---

### ✅ FIX 4: Web Manager - Verify Callback Route

The web manager callback page at `/auth/callback` exists and looks correct.

**Test**: After logging in via auth hub, check browser console for:
- "Session exchange error" - means code exchange failed
- "No authentication code received" - means auth hub didn't pass the code

**Common Issue**: The web manager uses `${window.location.origin}/auth/callback` for OAuth redirects. Make sure this exact URL is in Supabase's allowlist.

---

### ✅ FIX 5: Check Auth Hub Destination Configuration

**File**: `apps/auth/lib/config.ts`

Current destinations:
```typescript
const DESTINATIONS: Record<AppSlug, Partial<Record<Platform, Destination>>> = {
  manager: {
    web: {
      label: "Manager Web",
      value: `${MANAGER_WEB_URL.replace(/\/+$/, "")}/auth/callback/`,
    },
    desktop: {
      label: "Manager Desktop",
      value: "mfcmanager://oauth-callback",
    },
    mobile: {
      label: "Manager Mobile",
      value: "mfcmanager://oauth-callback",
    },
  },
  admin: {
    mobile: {
      label: "Admin Mobile",
      value: "mfcadmin://oauth-callback",
    },
  },
  user: {
    mobile: {
      label: "User Mobile",
      value: "mfcuser://oauth-callback",
    },
  },
};
```

**Issue**: Desktop should use the HTTPS callback page, not the custom protocol directly.

**Recommended Change**:
```typescript
const MANAGER_WEB_URL =
  process.env.NEXT_PUBLIC_MANAGER_WEB_URL?.trim() ||
  "https://manager.bill.mondalfishcenter.com";

const DESTINATIONS: Record<AppSlug, Partial<Record<Platform, Destination>>> = {
  manager: {
    web: {
      label: "Manager Web",
      value: `${MANAGER_WEB_URL.replace(/\/+$/, "")}/auth/callback/`,
    },
    desktop: {
      label: "Manager Desktop",
      value: `${MANAGER_WEB_URL.replace(/\/+$/, "")}/auth/desktop-callback/`,
    },
    mobile: {
      label: "Manager Mobile",
      value: "mfcmanager://oauth-callback",
    },
  },
  // ... admin and user stay the same
};
```

---

## 🔍 Debugging Steps

### Step 1: Enable Logging

Add this to your `.env` temporarily:
```env
DEBUG=supabase-js:*
```

### Step 2: Test Auth Hub Directly

Open this URL in your browser:
```
https://auth.mondalfishcenter.com/login?app=manager&platform=web
```

Try logging in. Check browser console for errors.

### Step 3: Test Mobile OAuth Flow

1. Open mobile app
2. Click "Login with Google" or "Login with email"
3. Watch Xcode/Android Studio logs for:
   - `[ManagerAuth] received oauth redirect`
   - `[ManagerAuth] parsed oauth params`
   - `[ManagerAuth] exchanging code for session`

If you don't see these logs, the deep link isn't reaching the app.

### Step 4: Test Desktop OAuth Flow

1. Open desktop app
2. Click login
3. Browser should open to auth hub
4. After auth, browser should redirect to desktop callback
5. Desktop app should receive `open-url` event

Check Electron dev tools for logs.

### Step 5: Check Network Requests

Open browser/app dev tools → Network tab

Look for:
- POST to `*/auth/v1/token` (code exchange)
- POST to `*/auth/v1/session` (session set)

If these return 400/401, your Supabase config is wrong.

---

## 🚀 Quick Fix Checklist

- [ ] Supabase redirect URLs allowlisted (all 5 URLs above)
- [ ] Google OAuth provider enabled in Supabase with correct credentials
- [ ] `.env` file has correct `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- [ ] Mobile apps build and run with deep linking working
- [ ] Desktop app's `MANAGER_OAUTH_REDIRECT_URL` points to HTTPS callback page
- [ ] Web manager's `/auth/callback` page is accessible
- [ ] Auth hub is deployed and accessible at `https://auth.mondalfishcenter.com`

---

## 📝 Common Error Messages & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| "Could not sign in. Try again." | Wrong credentials or Supabase misconfigured | Check Supabase URL/anon key |
| "No destination is configured" | Missing platform in config.ts | Add missing destination |
| "The mobile return URL is missing its nested callback" | Expo dev client URL malformed | Check `return_to` parameter |
| "Browser sign-in timed out" | Desktop app didn't receive callback | Check deep linking registration |
| "Could not complete sign-in" | Code exchange failed | Check Supabase OAuth settings |
| App opens but doesn't receive session | Deep link not registered | Rebuild app with correct scheme |

---

## 🎯 Immediate Action Items

1. **Verify Supabase redirect URLs** - This is the #1 cause
2. **Test auth hub directly** - `https://auth.mondalfishcenter.com/login?app=manager&platform=web`
3. **Check browser console** for OAuth errors
4. **Check mobile app logs** for auth state changes
5. **Update desktop redirect URL** to use HTTPS callback page

---

## Need More Help?

Run this diagnostic script to check your configuration:

```bash
# Check if auth hub is accessible
curl -I https://auth.mondalfishcenter.com/login?app=manager&platform=web

# Check if web manager callback is accessible
curl -I https://manager.bill.mondalfishcenter.com/auth/callback

# Check if desktop callback is accessible  
curl -I https://manager.bill.mondalfishcenter.com/auth/desktop-callback
```

All should return HTTP 200.
