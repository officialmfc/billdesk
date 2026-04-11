# Mobile Build And Secrets

This repository now has:

- desktop release workflow
- mobile EAS build workflow

The mobile workflow is:

- `.github/workflows/mobile-eas-build.yml`

It is designed for:

- manager mobile
- admin mobile
- user mobile
- Android and iOS

## Why EAS For iOS

Android can be built locally in CI more easily.

iOS release builds are much more sensitive because of:

- macOS runner requirements
- Apple signing credentials
- provisioning profiles
- certificate management

So the repository uses EAS build for mobile release orchestration.

That keeps Android and iOS under one workflow path.

## Recommended Secret Source

Keep the canonical secrets in Infisical.

Then sync them into GitHub Actions secrets.

The workflow currently reads standard GitHub secrets, which fits Infisical-to-GitHub sync cleanly.

## Required GitHub Secrets

Populate these from Infisical:

```text
EXPO_TOKEN
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_POWERSYNC_URL
EXPO_EAS_PROJECT_ID_MANAGER
EXPO_EAS_PROJECT_ID_ADMIN
EXPO_EAS_PROJECT_ID_USER
```

`EXPO_PUBLIC_POWERSYNC_URL` is only required by manager mobile, but it is safe to expose it uniformly in the workflow.

## EAS Project IDs

Current config:

- manager app supports env override and has a fallback project id
- user app supports env override and has a fallback project id
- admin app uses `EXPO_EAS_PROJECT_ID_ADMIN`

So for admin builds, set:

```text
EXPO_EAS_PROJECT_ID_ADMIN
```

## Running The Workflow

Use the GitHub Actions manual trigger:

- `app`: `manager`, `admin`, `user`, or `all`
- `platform`: `android`, `ios`, or `all`
- `profile`: `preview` or `production`

Because Expo free-tier build counts are limited, this workflow is intentionally manual instead of tag-triggered by default.

## Recommended Production Setup

### Preview / internal testing

- profile: `preview`
- platform: `android`
- platform: `ios`

### Store / production

- profile: `production`
- build each app intentionally, one at a time if quota matters

## Notes About Infisical

If you use direct Infisical GitHub integration:

- keep Infisical as the source of truth
- let it populate the GitHub repository secrets used by this workflow

If later you want fully direct secret pull inside the workflow, add an Infisical GitHub action or CLI step before `eas build`.

The current workflow does not hardcode a specific Infisical action, so it remains simple and stable.
