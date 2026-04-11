# MFC Manager Mobile App

Mobile application for MFC (Market Fee Collection) managers to handle sales, inventory, and customer management.

## Getting Started

From the monorepo root:

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev:manager

# Run on Android
pnpm android:manager

# Run on iOS
pnpm ios:manager
```

## Environment Setup

Copy `.env.example` to `.env` and configure your Supabase credentials:

```bash
cp .env.example .env
```

## Features

- Sales management (auction and direct sales)
- Customer and seller ledgers
- Quote management
- Offline-first with sync capabilities
- Real-time updates via Supabase

## Tech Stack

- React Native with Expo
- Expo Router for navigation
- Drizzle ORM with SQLite
- Supabase for backend
- React Native Paper for UI components
