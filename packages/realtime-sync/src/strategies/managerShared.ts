import type { SyncTransformContext } from '../types';
import { MANAGER_READ_MODEL_SELECT_COLUMNS } from '@mfc/manager-sync-model';
import { CacheKeys } from '../utils/name-cache';

export type ManagerSharedSelectColumns = {
    users: string[];
    mfc_staff: string[];
    products: string[];
    stock_batches: string[];
    daily_bills: string[];
    sale_transactions: string[];
    chalans: string[];
    quotes: string[];
    quote_items: string[];
    customer_payments: string[];
    seller_payments: string[];
    manager_spendings: string[];
    customer_balance: string[];
    seller_balance: string[];
};

export const MANAGER_SHARED_SELECT_COLUMNS: ManagerSharedSelectColumns = {
    users: [...MANAGER_READ_MODEL_SELECT_COLUMNS.users],
    mfc_staff: [...MANAGER_READ_MODEL_SELECT_COLUMNS.mfc_staff],
    products: [...MANAGER_READ_MODEL_SELECT_COLUMNS.products],
    stock_batches: [...MANAGER_READ_MODEL_SELECT_COLUMNS.stock_batches],
    daily_bills: [...MANAGER_READ_MODEL_SELECT_COLUMNS.daily_bills],
    sale_transactions: [...MANAGER_READ_MODEL_SELECT_COLUMNS.sale_transactions],
    chalans: [...MANAGER_READ_MODEL_SELECT_COLUMNS.chalans],
    quotes: [...MANAGER_READ_MODEL_SELECT_COLUMNS.quotes],
    quote_items: [...MANAGER_READ_MODEL_SELECT_COLUMNS.quote_items],
    customer_payments: [...MANAGER_READ_MODEL_SELECT_COLUMNS.customer_payments],
    seller_payments: [...MANAGER_READ_MODEL_SELECT_COLUMNS.seller_payments],
    manager_spendings: [...MANAGER_READ_MODEL_SELECT_COLUMNS.manager_spendings],
    customer_balance: [...MANAGER_READ_MODEL_SELECT_COLUMNS.customer_balance],
    seller_balance: [...MANAGER_READ_MODEL_SELECT_COLUMNS.seller_balance],
};

type CacheLike = Pick<Map<string, string>, 'get' | 'set' | 'has'>;

function getCache(context: SyncTransformContext): CacheLike {
    return context.cache as unknown as CacheLike;
}

async function getCachedValue(
    context: SyncTransformContext,
    key: string,
    resolver: () => Promise<string | undefined>
): Promise<string | undefined> {
    const cache = getCache(context);

    if (cache.has(key)) {
        return cache.get(key);
    }

    const value = await resolver();
    if (value) {
        cache.set(key, value);
    }

    return value;
}

async function resolveStaffName(
    context: SyncTransformContext,
    staffId?: string
): Promise<string | undefined> {
    if (!staffId) {
        return undefined;
    }

    return getCachedValue(context, CacheKeys.staffName(staffId), async () => {
        const staff = await context.db.mfc_staff.where('id').equals(staffId).first();
        return staff?.full_name;
    });
}

async function resolveUserDisplayName(
    context: SyncTransformContext,
    userId: string,
    key: string
): Promise<string | undefined> {
    return getCachedValue(context, key, async () => {
        const user = await context.db.users.where('id').equals(userId).first();
        return user?.business_name || user?.name;
    });
}

async function resolveProductName(
    context: SyncTransformContext,
    productId?: string
): Promise<string | undefined> {
    if (!productId) {
        return undefined;
    }

    return getCachedValue(context, CacheKeys.productName(productId), async () => {
        const product = await context.db.products.where('id').equals(productId).first();
        return product?.name;
    });
}

async function resolveBillNumber(
    context: SyncTransformContext,
    billId?: string
): Promise<string | undefined> {
    if (!billId) {
        return undefined;
    }

    return getCachedValue(context, `bill:${billId}:number`, async () => {
        const bill = await context.db.daily_bills.where('id').equals(billId).first();
        return bill?.bill_number;
    });
}

export async function transformWithCreatedBy(
    record: any,
    context: SyncTransformContext
): Promise<any> {
    return {
        ...record,
        created_by_name: await resolveStaffName(context, record.created_by),
    };
}

export async function transformStockBatch(
    record: any,
    context: SyncTransformContext
): Promise<any> {
    const createdByName = await resolveStaffName(context, record.created_by);
    const productName = await resolveProductName(context, record.product_id);
    const supplierName = record.supplier_id
        ? await resolveUserDisplayName(
              context,
              record.supplier_id,
              CacheKeys.supplierName(record.supplier_id)
          )
        : undefined;

    return {
        ...record,
        product_name: productName,
        supplier_name: supplierName,
        created_by_name: createdByName,
    };
}

export async function transformDailyBill(
    record: any,
    context: SyncTransformContext
): Promise<any> {
    const createdByName = await resolveStaffName(context, record.created_by);
    const buyerName = record.customer_id
        ? await resolveUserDisplayName(
              context,
              record.customer_id,
              CacheKeys.buyerName(record.customer_id)
          )
        : undefined;

    return {
        ...record,
        buyer_name: buyerName,
        created_by_name: createdByName,
    };
}

export async function transformSaleTransaction(
    record: any,
    context: SyncTransformContext
): Promise<any> {
    const createdByName = await resolveStaffName(context, record.created_by);
    const productName = await resolveProductName(context, record.product_id);
    const billNumber = await resolveBillNumber(context, record.daily_bill_id);

    return {
        ...record,
        product_name: productName,
        bill_number: billNumber,
        created_by_name: createdByName,
    };
}

export async function transformChalan(
    record: any,
    context: SyncTransformContext
): Promise<any> {
    const createdByName = await resolveStaffName(context, record.created_by);
    let sellerName: string | undefined;

    if (record.seller_id) {
        sellerName = await resolveUserDisplayName(
            context,
            record.seller_id,
            CacheKeys.sellerName(record.seller_id)
        );
    } else if (record.mfc_seller_id) {
        sellerName = await getCachedValue(
            context,
            `mfc_seller:${record.mfc_seller_id}:name`,
            async () => {
                const seller = await context.db.mfc_staff
                    .where('id')
                    .equals(record.mfc_seller_id)
                    .first();
                return seller?.full_name;
            }
        );
    }

    return {
        ...record,
        seller_name: sellerName,
        created_by_name: createdByName,
    };
}

export async function transformQuote(
    record: any,
    context: SyncTransformContext
): Promise<any> {
    const base = await transformWithCreatedBy(record, context);
    const buyerName = record.customer_id
        ? await resolveUserDisplayName(
              context,
              record.customer_id,
              CacheKeys.buyerName(record.customer_id)
          )
        : undefined;

    return {
        ...base,
        buyer_name: buyerName,
    };
}

export async function transformQuoteItem(
    record: any,
    context: SyncTransformContext
): Promise<any> {
    return {
        ...record,
        product_name: await resolveProductName(context, record.product_id),
    };
}
