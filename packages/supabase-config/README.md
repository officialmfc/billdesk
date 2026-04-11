# @mfc/supabase-config

This package provides a configured Supabase client for the MFC BillDesk application.

## Overview

This package exports a singleton Supabase client that can be used to interact with the Supabase backend.

## Usage

To use the Supabase client, simply import it from this package:

```tsx
import { supabase } from '@mfc/supabase-config';

async function getUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error(error);
  }
  return data;
}
```
