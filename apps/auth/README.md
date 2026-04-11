# Auth Hub

`apps/auth` is the server-side auth application for:

- `https://auth.mondalfishcenter.com`

Production shape:

- **Cloudflare Pages** in `apps/auth-ui` for the public auth UI and same-origin `/api/*` facade
- **Cloudflare Worker** in `apps/auth` as `auth-core` for handoff, registration finalization, device leases, invite flows, and account APIs
- **Cloudflare Worker** in `apps/auth-policy` for preflight gating, audit sync, rate limits, and ZeptoMail delivery
- **Cloudflare D1** shared across the split runtime for staged auth workflow and durable auth state
- **Cloudflare KV** for short-lived abuse and rate-limit counters
- **Supabase Auth** for real authenticated users and sessions
- **Supabase Postgres** only for final business records and access checks
- **ZeptoMail API** as the single outbound email sender
- **Formspree** for external worker error logging

## What lives where

### D1

Current D1 migrations:

- [0001_registration_requests.sql](/Users/as/workspace/billdesk/apps/auth/d1/migrations/0001_registration_requests.sql)
- [0002_auth_handoffs.sql](/Users/as/workspace/billdesk/apps/auth/d1/migrations/0002_auth_handoffs.sql)
- [0003_auth_device_leases.sql](/Users/as/workspace/billdesk/apps/auth/d1/migrations/0003_auth_device_leases.sql)
- [0004_auth_control_plane.sql](/Users/as/workspace/billdesk/apps/auth/d1/migrations/0004_auth_control_plane.sql)
- [0005_auth_flows.sql](/Users/as/workspace/billdesk/apps/auth/d1/migrations/0005_auth_flows.sql)

Tables:

- `registration_requests`
  - self registration workflow state
  - invite workflow state
  - approval / rejection state
  - activation token metadata
  - registration event audit trail
- `auth_handoffs`
  - one-time app handoff ids
  - access / refresh token escrow
  - short-lived redirect coordination
- `auth_device_leases`
  - one active device per `app + platform` slot
  - last seen timestamps
  - revocation state for logout-all and device replacement
- `auth_account_directory`
  - minimal auth read-model mirrored from invites, approvals, and logins
  - approved / invited / active / blocked state before Supabase final access checks
  - last login device/ip tracking for account center UI
- `auth_audit_events`
  - durable auth decision audit trail
  - preflight allow / deny decisions
  - rate-limit and block reasons
- `auth_flows`
  - server-owned auth flow state for login, callback, confirm, reset, and invite flows
  - `flowId` carries app, platform, device, next, return target, and email seed through the whole flow
  - prevents auth context drift across browser, web, mobile, and desktop callbacks

### Supabase

Supabase remains the source of truth for:

- `auth.users`
- final `public.users`
- final `public.mfc_staff`
- public RPC wrappers that forward into private finalization / access-check functions

Current additive Supabase migration:

- [20260408152000_auth_app_private_functions.sql](/Users/as/workspace/billdesk/supabase/migrations/20260408152000_auth_app_private_functions.sql)
- [20260408153000_public_auth_app_wrappers.sql](/Users/as/workspace/billdesk/supabase/migrations/20260408153000_public_auth_app_wrappers.sql)

Historical auth migrations kept for reference only:

- [20260406203000_auth_registration_invites.sql](/Users/as/workspace/billdesk/supabase/migrations/20260406203000_auth_registration_invites.sql)
- [20260407193000_cleanup_legacy_public_registrations.sql](/Users/as/workspace/billdesk/supabase/migrations/20260407193000_cleanup_legacy_public_registrations.sql)

For a fresh clean install, apply the current additive migrations above in order.
Also apply these D1 migrations in order:

- [0001_registration_requests.sql](/Users/as/workspace/billdesk/apps/auth/d1/migrations/0001_registration_requests.sql)
- [0002_auth_handoffs.sql](/Users/as/workspace/billdesk/apps/auth/d1/migrations/0002_auth_handoffs.sql)
- [0003_auth_device_leases.sql](/Users/as/workspace/billdesk/apps/auth/d1/migrations/0003_auth_device_leases.sql)
- [0004_auth_control_plane.sql](/Users/as/workspace/billdesk/apps/auth/d1/migrations/0004_auth_control_plane.sql)
- [0005_auth_flows.sql](/Users/as/workspace/billdesk/apps/auth/d1/migrations/0005_auth_flows.sql)

## Current behavior

Implemented now:

- `auth-ui` Pages is the public auth surface for `https://auth.mondalfishcenter.com`
- `auth-core` and `auth-policy` are private Workers behind Pages Functions service bindings
- self-registration is staged in D1 through `POST /api/register/self`
- admin and manager invite creation goes through auth server routes
- invite emails are sent by the auth server through ZeptoMail
- self-registration approval emails are sent by the auth server through ZeptoMail
- app handoff now uses one-time `handoff` ids instead of putting tokens in the redirect URL
- destination apps exchange the `handoff` id for the session tokens over HTTPS
- Supabase auth emails are routed through the Send Email hook endpoint at `POST /api/hooks/supabase/send-email`
- mobile, desktop, and web callback screens accept `handoff` ids and restore the Supabase session from the auth server
- all auth starts and callbacks now use server-owned `flowId` state in D1 instead of reconstructing device/app/platform context from scattered query params
- auth preflight runs before login, magic link, password reset, invite signup, and self-registration
- account center lives on `https://auth.mondalfishcenter.com/` with `/account` as an alias
- account center shows current account state, active device leases, revoke-device actions, logout, logout-all, and password reset
- one device lease is allowed per `app + platform` slot
- short-lived bot / abuse counters run through Cloudflare KV and durable auth decisions are recorded in D1

## Required env

Public:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `NEXT_PUBLIC_MANAGER_WEB_URL`
- `NEXT_PUBLIC_AUTH_BASE_URL`

Server-only:

- `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SECRET_KEY`
- `ZEPTOMAIL_API_KEY`
- `ZEPTOMAIL_API_URL`
- `ZEPTOMAIL_FROM_EMAIL`
- `ZEPTOMAIL_FROM_NAME`
- `SUPABASE_SEND_EMAIL_HOOK_SECRET`
- `AUTH_RATE_LIMIT_KV`
- Worker error logs are sent to the hardcoded Formspree endpoint in `apps/auth/lib/server/logger.ts`

### ZeptoMail

All auth emails use the same branded inline renderer. The worker sends a single ZeptoMail HTML payload for:

- signup confirmation
- invite
- magic link
- password recovery
- email change
- re-authentication

## Cloudflare setup

### 1. Install dependencies

From repo root:

```bash
pnpm install
```

### 2. Create or verify the D1 database

The split auth runtime expects the same `auth_d1_binding` binding in:

- [apps/auth/wrangler.jsonc](/Users/as/workspace/billdesk/apps/auth/wrangler.jsonc)
- [apps/auth-policy/wrangler.jsonc](/Users/as/workspace/billdesk/apps/auth-policy/wrangler.jsonc)
- [apps/auth-ui/wrangler.jsonc](/Users/as/workspace/billdesk/apps/auth-ui/wrangler.jsonc)

If you are creating a fresh D1 database, use:

```bash
pnpm --dir apps/auth exec wrangler d1 create auth-hub
```

Copy the printed `database_id` into `apps/auth/wrangler.jsonc`.

### 3. Apply the D1 schema

Local:

```bash
pnpm --dir apps/auth exec wrangler d1 execute auth_d1_binding --local --file ./d1/migrations/0001_registration_requests.sql
pnpm --dir apps/auth exec wrangler d1 execute auth_d1_binding --local --file ./d1/migrations/0002_auth_handoffs.sql
pnpm --dir apps/auth exec wrangler d1 execute auth_d1_binding --local --file ./d1/migrations/0003_auth_device_leases.sql
pnpm --dir apps/auth exec wrangler d1 execute auth_d1_binding --local --file ./d1/migrations/0004_auth_control_plane.sql
pnpm --dir apps/auth exec wrangler d1 execute auth_d1_binding --local --file ./d1/migrations/0005_auth_flows.sql
```

Remote:

```bash
pnpm --dir apps/auth exec wrangler d1 execute auth_d1_binding --remote --file ./d1/migrations/0001_registration_requests.sql
pnpm --dir apps/auth exec wrangler d1 execute auth_d1_binding --remote --file ./d1/migrations/0002_auth_handoffs.sql
pnpm --dir apps/auth exec wrangler d1 execute auth_d1_binding --remote --file ./d1/migrations/0003_auth_device_leases.sql
pnpm --dir apps/auth exec wrangler d1 execute auth_d1_binding --remote --file ./d1/migrations/0004_auth_control_plane.sql
pnpm --dir apps/auth exec wrangler d1 execute auth_d1_binding --remote --file ./d1/migrations/0005_auth_flows.sql
```

### 4. Configure Cloudflare deploy

Recommended production split:

- `apps/auth` deploys the internal `auth-core` Worker:
  - Preview: `pnpm --dir apps/auth exec wrangler deploy --dry-run --config wrangler.jsonc --keep-vars`
  - Deploy: `pnpm --dir apps/auth exec wrangler deploy --config wrangler.jsonc --keep-vars`
- `apps/auth-policy` deploys the internal `auth-policy` Worker:
  - Preview: `pnpm --dir apps/auth-policy exec wrangler deploy --dry-run --config wrangler.jsonc --keep-vars`
  - Deploy: `pnpm --dir apps/auth-policy exec wrangler deploy --config wrangler.jsonc --keep-vars`
- `apps/auth-ui` deploys the public Pages project:
  - Bind `AUTH_CORE` -> `auth-core`
  - Bind `AUTH_POLICY` -> `auth-policy`
  - Use `public/` as the Pages asset output
  - Pages Functions in `functions/[[path]].ts` proxy `/api/*` to the internal workers
- Use `pnpm sync:auth:secrets` to upload whatever auth envs already exist in Infisical to the split stack
- Add the remaining missing secrets manually in Cloudflare until Infisical is fully seeded

### 5. Add build variables and secrets

In Cloudflare build variables / secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `NEXT_PUBLIC_MANAGER_WEB_URL`
- `NEXT_PUBLIC_AUTH_BASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SECRET_KEY`
- `ZEPTOMAIL_API_KEY`
- `ZEPTOMAIL_API_URL`
- `ZEPTOMAIL_FROM_EMAIL`
- `ZEPTOMAIL_FROM_NAME`
- `SUPABASE_SEND_EMAIL_HOOK_SECRET`

### 6. Configure Cloudflare KV

The auth control-plane uses the `AUTH_RATE_LIMIT_KV` binding in:

- [apps/auth/wrangler.jsonc](/Users/as/workspace/billdesk/apps/auth/wrangler.jsonc)
- [apps/auth-policy/wrangler.jsonc](/Users/as/workspace/billdesk/apps/auth-policy/wrangler.jsonc)
- [apps/auth-ui/wrangler.jsonc](/Users/as/workspace/billdesk/apps/auth-ui/wrangler.jsonc)

The current namespace id is already wired for production. If you need a new one, use:

```bash
pnpm --dir apps/auth exec wrangler kv namespace create auth-rate-limit --binding AUTH_RATE_LIMIT_KV --update-config --config wrangler.jsonc
```

## Route contract

Implemented:

- `GET /api/health`
- `POST /api/register/self`
- `POST /api/register/invite`
- `POST /api/invites/manager`
- `POST /api/invites/user`
- `GET /api/invites/context`
- `GET /api/requests`
- `POST /api/requests/:id/approve`
- `POST /api/requests/:id/reject`
- `POST /api/auth/preflight`
- `POST /api/auth/handoff`
- `POST /api/auth/exchange`
- `GET /api/devices`
- `POST /api/devices/lease`
- `POST /api/devices/revoke`
- `POST /api/devices/revoke-all`
- `GET /api/account`
- `POST /api/hooks/supabase/send-email`

## Supabase redirect URLs

Keep at minimum:

- `https://auth.mondalfishcenter.com/callback`
- `https://auth.mondalfishcenter.com/confirm`
- `https://auth.mondalfishcenter.com/reset-password`
- `mfcmanager://oauth-callback`
- `mfcadmin://oauth-callback`
- `mfcuser://oauth-callback`
- `https://manager.bill.mondalfishcenter.com/auth/callback`

## Security direction

- self signup does **not** create `auth.users` immediately
- wrong app / role combinations are denied on the auth hub without redirect
- admin cannot access manager
- manager cannot access admin
- invites and approvals are handled by the auth server
- app handoff now uses a one-time server exchange
- Supabase auth emails go through the Send Email hook endpoint and ZeptoMail
- account/device enforcement happens in the auth server before the user reaches the destination app
- D1 stores the durable auth read-model and audit trail
- Cloudflare KV stores short-lived rate-limit counters for auth abuse control
