# Manager Platform Architecture

## Goal

The manager surface should stop diverging across platforms.

- Web mobile layout and the React Native mobile app should follow the same manager mobile shell.
- Web desktop layout and the Electron app should follow the same desktop shell.
- Mobile and Electron should share the same PowerSync-backed read model.
- Web should stay lighter: Dexie for fast local lookups and current-day operations, direct Supabase for older and non-local reads.

## Shared Packages

### `@mfc/manager-ui`

This is the manager-specific UI contract package.

It owns:

- manager navigation definitions
- manager mobile tab definitions
- manager desktop sidebar groups
- manager sale-flow definitions
- desktop sale view routing metadata

Apps should import manager shell and sale metadata from this package instead of duplicating labels, route maps, or grouping rules locally.

### `@mfc/manager-sync-model`

This package owns the manager sync/read-model contract.

It owns:

- PowerSync bucket name
- PowerSync DB filename
- read-model table list
- shared select column definitions
- web Dexie persistent/today-only table scopes

## Platform Split

### Mobile app

- UI shell: `@mfc/manager-ui`
- read model: PowerSync local SQLite
- writes: direct Supabase RPCs / table writes

### Electron app

- UI shell: `@mfc/manager-ui`
- read model: PowerSync local SQLite
- writes: direct Supabase RPCs / table writes

### Web manager

- UI shell: `@mfc/manager-ui`
- local cache: Dexie
- local scope:
  - persistent master data
  - current Kolkata business day operational data
- historical reads: direct Supabase

## Current Rule

If a manager-facing label, route grouping, sale flow name, or shell section is needed in more than one app, it should move to `@mfc/manager-ui` first instead of being copied into app-local code.

## Next Refactor Targets

The current repo now shares manager shell metadata, but still has app-local presentational components.

Next extraction candidates:

- shared sale-entry layout primitives for desktop web + Electron
- shared mobile manager page scaffolds for web mobile + React Native
- shared manager account card and `More` section content models
- shared operations page cards and empty/error state copy
