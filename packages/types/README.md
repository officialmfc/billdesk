# @mfc/types

This package contains shared TypeScript types and interfaces used throughout the MFC BillDesk application.

## Overview

By centralizing our types, we can ensure consistency and type safety across the entire monorepo.

## Usage

To use a type from this package, simply import it into your application:

```tsx
import { User } from '@mfc/types';

function MyComponent({ user }: { user: User }) {
  return <div>{user.name}</div>;
}
```
