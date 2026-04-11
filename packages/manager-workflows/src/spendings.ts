import type { ManagerStaffRecord } from "@mfc/manager-ui";

export type ManagerSpendingRecord = {
  id: string;
  spent_date: string;
  title: string;
  category: string;
  amount: number | string;
  note?: string | null;
  payment_method: string;
  created_by?: string | null;
  updated_at?: string | null;
};

export type ManagerSpendingsReadModel = {
  spendings: ManagerSpendingRecord[];
  staff?: ManagerStaffRecord[];
};

export type ManagerSpendingRow = {
  amount: number;
  category: string;
  createdById: string | null;
  createdByName: string | null;
  id: string;
  note: string | null;
  paymentMethod: string;
  spentDate: string;
  title: string;
};

export type ManagerSpendingsOverview = {
  categoryTotals: Array<{
    category: string;
    count: number;
    totalAmount: number;
  }>;
  rows: ManagerSpendingRow[];
  totalAmount: number;
};

function asNumber(value: number | string | null | undefined): number {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

function matchesQuery(parts: Array<string | null | undefined>, query: string): boolean {
  if (!query) {
    return true;
  }

  return parts.some((value) => value?.toLowerCase().includes(query));
}

export function buildManagerSpendingsOverview(
  model: ManagerSpendingsReadModel,
  options?: {
    date?: string;
    search?: string;
  }
): ManagerSpendingsOverview {
  const query = options?.search?.trim().toLowerCase() ?? "";
  const staffById = new Map((model.staff ?? []).map((member) => [member.id, member.full_name]));

  const rows = model.spendings
    .filter((spending) => !options?.date || spending.spent_date === options.date)
    .filter((spending) =>
      matchesQuery(
        [
          spending.title,
          spending.category,
          spending.note ?? null,
          spending.payment_method,
          spending.created_by ? staffById.get(spending.created_by) ?? null : null,
        ],
        query
      )
    )
    .map((spending) => ({
      amount: asNumber(spending.amount),
      category: spending.category,
      createdById: spending.created_by ?? null,
      createdByName: spending.created_by ? staffById.get(spending.created_by) ?? null : null,
      id: spending.id,
      note: spending.note ?? null,
      paymentMethod: spending.payment_method,
      spentDate: spending.spent_date,
      title: spending.title,
    }))
    .sort((left, right) => {
      const dateCompare = right.spentDate.localeCompare(left.spentDate);
      if (dateCompare !== 0) {
        return dateCompare;
      }

      return right.id.localeCompare(left.id);
    });

  const categoryMap = new Map<string, { category: string; count: number; totalAmount: number }>();

  for (const row of rows) {
    const key = row.category.trim() || "general";
    const current = categoryMap.get(key) ?? {
      category: key,
      count: 0,
      totalAmount: 0,
    };

    current.count += 1;
    current.totalAmount += row.amount;
    categoryMap.set(key, current);
  }

  return {
    categoryTotals: Array.from(categoryMap.values()).sort((left, right) => {
      const totalCompare = right.totalAmount - left.totalAmount;
      if (totalCompare !== 0) {
        return totalCompare;
      }

      return left.category.localeCompare(right.category);
    }),
    rows,
    totalAmount: rows.reduce((sum, row) => sum + row.amount, 0),
  };
}
