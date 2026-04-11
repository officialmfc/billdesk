# @mfc/utils

Shared utility functions for MFC BillDesk applications.

## Installation

```bash
pnpm add @mfc/utils
```

## Usage

### Formatting

```typescript
import { formatCurrency, formatDate, formatWeight } from "@mfc/utils";

formatCurrency(1234.56); // ₹1,234.56
formatDate("2025-10-31"); // 31 Oct 2025
formatWeight(12.5); // 12.50 kg
```

### Class Names

```typescript
import { cn } from "@mfc/utils";

cn("px-4 py-2", isActive && "bg-blue-500"); // Merges Tailwind classes
```

### Validation

```typescript
import { isValidEmail, isValidPhone, isPositiveNumber } from "@mfc/utils";

isValidEmail("test@example.com"); // true
isValidPhone("9876543210"); // true
isPositiveNumber(10); // true
```

### Date Utilities

```typescript
import { getDateRange, getTodayDate, isToday } from "@mfc/utils";

getDateRange("week"); // { startDate: '2025-10-24', endDate: '2025-10-31' }
getTodayDate(); // '2025-10-31'
isToday("2025-10-31"); // true
```

## Features

- **Formatting**: Currency, dates, weights, phone numbers, percentages
- **Validation**: Email, phone, numbers, dates, UUIDs
- **Date Utilities**: Date ranges, formatting, comparisons
- **Class Names**: Tailwind CSS class merging
- **Type Safe**: Full TypeScript support
- **Zero Dependencies**: Minimal external dependencies

## API Reference

See individual files for detailed documentation:

- `format.ts` - Formatting functions
- `validation.ts` - Validation functions
- `date.ts` - Date manipulation functions
- `cn.ts` - Class name utilities
