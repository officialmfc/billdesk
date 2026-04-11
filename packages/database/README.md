# @mfc/database

IndexedDB schema and type definitions for MFC BillDesk application.

## Overview

This package provides the IndexedDB schema definition using Dexie.js and TypeScript type definitions for all database entities. It is intentionally minimal and focused solely on schema management.

**Important**: This package does NOT contain business logic, data access patterns, or sync operations. Those belong in `@mfc/data-access`.

## What's Included

- **Schema Definition**: Dexie.js schema with optimized indexes
- **Type Definitions**: TypeScript interfaces for all entities
- **Migration System**: Schema versioning and upgrade logic
- **Database Instance**: Singleton database instance

## Installation

```bash
pnpm add @mfc/database
```

## Usage

### Basic Usage

```typescript
import { db, LocalUser, LocalProduct } from '@mfc/database';

// Query users
const users = await db.users.toArray();

// Add a product
await db.products.add({
  id: 'prod-1',
  name: 'Salmon',
  description: 'Fresh Atlantic Salmon',
  is_stock_tracked: true,
  updated_at: new Date().toISOString(),
});

// Query with filters
const activeUsers = await db.users
  .where('is_active')
  .equals(true)
  .toArray();
```

### Type Safety

All entities are fully typed:

```typescript
import type { LocalUser, LocalProduct, LocalStockBatch } from '@mfc/database';

const user: LocalUser = {
  id: 'user-1',
  auth_user_id: 'auth-123',
  name: 'John Doe',
  business_name: 'Doe Fish Market',
  phone: '+1234567890',
  user_type: 'business',
  default_role: 'buyer',
  is_active: true,
  address: null,
  updated_at: new Date().toISOString(),
};
```

### Migrations

The package includes a migration system for schema versioning:

```typescript
import { 
  getCurrentVersion, 
  getLatestVersion, 
  needsMigration,
  getMigrationHistory 
} from '@mfc/database';

// Check current version
const currentVersion = getCurrentVersion(db);
console.log(`Current schema version: ${currentVersion}`);

// Check if migration needed
if (needsMigration(db)) {
  console.log('Database needs migration');
}

// View migration history
const history = getMigrationHistory();
console.log('Migration history:', history);
```

## Schema Structure

### User Management
- `users` - Customers (buyers/sellers)
- `mfc_staff` - Internal staff members

### Product & Inventory
- `products` - Fish products
- `stock_batches` - Inventory batches

### Sales & Billing
- `daily_bills` - Customer invoices
- `sale_transactions` - Sale line items
- `chalans` - Seller commission documents

### Quotations
- `quotes` - Customer quotations
- `quote_items` - Quote line items

### Payments
- `customer_payments` - Payments from customers
- `seller_payments` - Payments to sellers

### Balances
- `customer_balance` - Customer account balances
- `seller_balance` - Seller account balances

### Metadata
- `sync_metadata` - Sync tracking per table
- `settings` - Application settings

## Index Optimization

The schema includes optimized indexes for common query patterns:

### Compound Indexes
- `[customer_id+bill_date]` - Customer billing history
- `[seller_id+chalan_date]` - Seller chalan history
- `[customer_id+delivery_date]` - Customer order scheduling
- `[daily_bill_id+payment_date]` - Payment history
- `[chalan_id+payment_date]` - Seller payment history

### Single Indexes
All tables include indexes on:
- Primary key (`id` or `user_id`)
- Foreign keys for relationships
- `updated_at` for sync operations
- Status fields for filtering
- Name fields for search/autocomplete

## Performance Considerations

### Denormalized Fields
The schema includes cached/denormalized fields (e.g., `product_name`, `buyer_name`) to reduce the need for joins and improve query performance:

```typescript
interface LocalStockBatch {
  id: string;
  product_id: string;
  // ... other fields
  
  // Cached denormalized fields
  product_name?: string;
  supplier_name?: string;
  created_by_name?: string;
}
```

### Query Optimization
Use compound indexes for common query patterns:

```typescript
// Efficient: Uses compound index [customer_id+bill_date]
const customerBills = await db.daily_bills
  .where('[customer_id+bill_date]')
  .between(
    [customerId, startDate],
    [customerId, endDate]
  )
  .toArray();
```

## Migration Guide

If you're migrating from the old database package that included business logic, see [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) for details on:

- Deprecated files and functions
- Where to move business logic
- Updated usage patterns

## Schema Versioning

Current schema version: **2**

### Version History

- **v1**: Initial schema (legacy)
- **v2**: Refactored schema aligned with Supabase, optimized indexes

### Adding New Migrations

When adding a new migration:

1. Never modify existing migrations
2. Increment the version number
3. Add the new migration to `migrations.ts`
4. Test thoroughly before deploying
5. Document breaking changes

```typescript
// Example new migration
{
  version: 3,
  description: 'Add new_table for feature X',
  up: (db) => {
    db.version(3).stores({
      // ... existing tables
      new_table: 'id, field1, field2, updated_at',
    });
  },
  migrate: async (db) => {
    // Optional data migration
    console.log('Migrating data for v3...');
  },
}
```

## Best Practices

### DO ✅
- Use this package for schema and type definitions only
- Use compound indexes for common query patterns
- Keep denormalized fields in sync during updates
- Use transactions for multi-table operations
- Test migrations before deploying

### DON'T ❌
- Add business logic to this package
- Modify existing migrations
- Skip schema versioning
- Perform complex queries without indexes
- Use this package for data access patterns (use `@mfc/data-access` instead)

## Related Packages

- `@mfc/data-access` - Data access layer with query builder, cache, and sync
- `@mfc/types` - Shared TypeScript types
- `@mfc/utils` - Utility functions

## License

Private - MFC BillDesk
