# CI Secrets and Variables

Use GitHub Secrets or GitHub Variables. The workflows now accept either source.

## Expo / EAS
- `EXPO_TOKEN` or `EXPO_ACCESS_TOKEN`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_POWERSYNC_URL`
- `EXPO_EAS_PROJECT_ID_MANAGER`
- `EXPO_EAS_PROJECT_ID_ADMIN`
- `EXPO_EAS_PROJECT_ID_USER`

## Cloudflare R2
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_BUCKET`
- `CLOUDFLARE_R2_ENDPOINT`

## Notes
- GitHub Actions variables work the same as secrets for these workflows.
- If a token is synced by an external plugin, put it in the repo-level variables or secrets so Actions can read it.
