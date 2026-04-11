# @mfc/data-access

Unified data access layer providing a consistent interface for querying, mutating, and subscribing to data across IndexedDB and Supabase.

## Features

- 🎯 **Unified API**: Single interface for all data operations
- ⚡ **Smart Caching**: Automatic caching with TTL support
- 🔄 **Real-time Updates**: Automatic UI updates when data changes
- 📴 **Offline-First**: Works seamlessly offline with automatic sync
- 🪝 **React Hooks**: Easy-to-use hooks for data fetching and mutations
- 🎨 **Type-Safe**: Full TypeScript support with type inference
- 🚀 **Performance**: Optimized queries with batching and deduplication

## Installation

```bash
pnpm add @mfc/data-access
```

## Quick Start

### Using React Hooks

```typescript
import { useQuery, useMutation } from '@mfc/data-access/hooks';

function ProductList() {
  // Fetch products with automatic caching and real-time updates
  const { data: products, loading, error } = useQuery('products', {
    orderBy: 'name',
    limit: 50,
  });

  // Create mutation for adding products
  const { mutate: createProduct, loading: creating } = useMutation('products');

  const handleCreate = async () => {
    await createProduct({
      name: 'New Product',
      description: 'Product description',
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
      <button onClick={handleCreate} disabled={creating}>
        Add Product
      </button>
    </div>
  );
}
```

### Direct Client Usage

```typescript
import { dal } from '@mfc/data-access';

// Query data
const products = await dal.query('products', {
  where: { is_stock_tracked: true },
  orderBy: 'name',
  limit: 10,
});

// Mutate data
const newProduct = await dal.mutate('products', {
  operation: 'insert',
  data: {
    name: 'Fish Product',
    description: 'Fresh fish',
  },
});

// Subscribe to changes
const subscription = dal.subscribe('products', {
  onData: (products) => console.log('Products updated:', products),
  onError: (error) => console.error('Error:', error),
});

// Cleanup
subscription.unsubscribe();
```

## API Reference

### Hooks

#### `useQuery<T>(table, options?)`

Fetch data with automatic caching and real-time updates.

**Parameters:**
- `table`: Table name
- `options`: Query options (where, orderBy, limit, etc.)

**Returns:**
- `data`: Query results
- `loading`: Loading state
- `error`: Error if any
- `refetch`: Function to manually refetch data

#### `useMutation<T>(table)`

Create, update, or delete data with optimistic updates.

**Parameters:**
- `table`: Table name

**Returns:**
- `mutate`: Function to perform mutation
- `loading`: Loading state
- `error`: Error if any

#### `useSubscription<T>(table, options?)`

Subscribe to real-time data changes.

**Parameters:**
- `table`: Table name
- `options`: Subscription options

**Returns:**
- `data`: Current data
- `loading`: Loading state
- `error`: Error if any

### Client Methods

#### `dal.query<T>(table, options)`

Query data from IndexedDB/Supabase.

#### `dal.mutate<T>(table, options)`

Insert, update, or delete data.

#### `dal.subscribe<T>(table, options)`

Subscribe to data changes.

#### `dal.cache.get(key)`

Get cached data.

#### `dal.cache.set(key, data, ttl?)`

Set cached data with optional TTL.

#### `dal.cache.invalidate(pattern)`

Invalidate cached data matching pattern.

## Configuration

### Cache TTL

Default cache TTL is 30 seconds. Configure per query:

```typescript
const { data } = useQuery('products', {
  cacheTTL: 60000, // 60 seconds
});
```

### Offline Behavior

Data access layer automatically handles offline mode:
- Queries serve from IndexedDB
- Mutations queue for sync when online
- Real-time updates pause and resume

## Best Practices

1. **Use hooks in components**: Prefer `useQuery` and `useMutation` in React components
2. **Cache appropriately**: Set TTL based on data freshness needs
3. **Handle loading states**: Always show loading indicators
4. **Handle errors**: Provide user-friendly error messages
5. **Cleanup subscriptions**: Subscriptions auto-cleanup with hooks

## Migration Guide

### From Direct Supabase Calls

```typescript
// Before
const { data } = await supabase.from('products').select('*');

// After
const { data } = useQuery('products');
```

### From Direct IndexedDB Calls

```typescript
// Before
const products = await db.products.toArray();

// After
const { data: products } = useQuery('products');
```

## License

MIT
