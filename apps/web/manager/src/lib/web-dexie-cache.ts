"use client";

import type { LocalMfcStaff, LocalProduct, LocalUser } from "@mfc/database";
import { db } from "@mfc/database";

type WithId = {
  id: string;
};

async function mergeRowsById<T extends WithId>(
  table: {
    bulkGet(keys: string[]): Promise<Array<T | undefined>>;
    bulkPut(rows: T[]): Promise<unknown>;
  },
  rows: T[]
): Promise<void> {
  if (rows.length === 0) {
    return;
  }

  const dedupedRows = Array.from(new Map(rows.map((row) => [row.id, row])).values());
  const ids = dedupedRows.map((row) => row.id);
  const existingRows = await table.bulkGet(ids);

  await table.bulkPut(
    dedupedRows.map((row, index) => ({
      ...(existingRows[index] ?? {}),
      ...row,
    }))
  );
}

export async function cacheUsersInDexie(rows: LocalUser[]): Promise<void> {
  await mergeRowsById(db.users, rows);
}

export async function cacheMfcStaffInDexie(rows: LocalMfcStaff[]): Promise<void> {
  await mergeRowsById(db.mfc_staff, rows);
}

export async function cacheProductsInDexie(rows: LocalProduct[]): Promise<void> {
  await mergeRowsById(db.products, rows);
}
