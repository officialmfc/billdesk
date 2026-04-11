"use client";

import { cacheProductsInDexie } from "@/lib/web-dexie-cache";
import type { LocalProduct } from "@mfc/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CreateManagedProductInput {
  name: string;
  description?: string;
  isStockTracked?: boolean;
}

export async function createManagedProduct(
  supabase: SupabaseClient,
  input: CreateManagedProductInput
): Promise<LocalProduct> {
  const { data: insertedRow, error } = await supabase
    .from("products")
    .insert({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      is_stock_tracked: input.isStockTracked ?? true,
    })
    .select("id, name, description, is_stock_tracked, updated_at, created_by")
    .single();

  if (error) {
    throw error;
  }

  const createdProduct = insertedRow as LocalProduct;
  await cacheProductsInDexie([createdProduct]);
  return createdProduct;
}
