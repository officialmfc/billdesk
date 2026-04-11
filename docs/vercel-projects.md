# Vercel Projects

Use two separate Vercel projects:

## 1. Fallback site
- Domain: `bill.mondalfishcenter.com`
- Root directory: `vercel/fallback`
- Purpose: simple public landing page and fallback entrypoint

## 2. Manager web app
- Domain: `manger.bill.mondalfishcenter.com`
- Root directory: `apps/web/manager`
- Purpose: the full manager web application

## Why separate projects
- Different routes and frameworks
- Different env sets
- Cleaner deploy boundaries
- No accidental mixing of public fallback content with the manager app

## Suggested Vercel env mapping
- Fallback site:
  - only domain-specific redirect or support links
- Manager app:
  - Supabase, Infisical-synced secrets, OAuth redirects, and app configuration

## Local notes
- The repo root `.env.example` is only a template.
- Real values should live in Infisical and sync into Vercel/GitHub as needed.
