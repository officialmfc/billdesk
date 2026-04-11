# MFC BillDesk

MFC BillDesk is a comprehensive billing and inventory management solution designed for Mandi and commission-based businesses. It provides a robust set of tools for managing sales, collections, inventory, and user accounts, with a focus on offline-first functionality to ensure uninterrupted operation in any environment.

## Monorepo Structure

This project is a pnpm monorepo, organized into two main directories: `apps` for applications and `packages` for shared libraries.

### Applications

-   `apps/web/manager`: The main web application for managers and staff, providing access to all features.
-   `apps/web/user`: A user-facing web application for customers and vendors to view their accounts and transactions.

### Packages

-   `packages/auth`: Handles user authentication and authorization.
-   `packages/components`: A collection of reusable UI components.
-   `packages/core`: Core business logic and utilities.
-   `packages/database`: IndexedDB database layer using Dexie.
-   `packages/dexigo`: Dexie-based data access layer.
-   `packages/dexigo-react`: React hooks for Dexigo.
-   `packages/hooks`: A collection of reusable React hooks.
-   `packages/supabase-config`: Supabase client and configuration.
-   `packages/sync`: Handles data synchronization between the local database and Supabase.
-   `packages/types`: Shared TypeScript types and interfaces.
-   `packages/utils`: A collection of utility functions.

## Getting Started

To get started with MFC BillDesk, you'll need to have Node.js and pnpm installed.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/mfc-billdesk.git
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Set up environment variables:**
    Create a `.env.local` file in `apps/web/manager` and `apps/web/user` and add the required environment variables.
4.  **Run the development server:**
    ```bash
    pnpm dev
    ```

## Technology Stack

-   **Frontend:** React, Next.js, TypeScript
-   **Backend:** Supabase
-   **Database:** IndexedDB (via Dexie)
-   **UI:** Tailwind CSS, shadcn/ui
-   **Testing:** Vitest, Playwright
-   **Package Manager:** pnpm
