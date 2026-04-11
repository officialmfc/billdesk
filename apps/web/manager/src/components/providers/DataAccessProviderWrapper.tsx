'use client';

/**
 * DataAccessProviderWrapper
 * Wraps the app with DataAccessProvider and initializes the data access layer
 */

import { logger } from "@/lib/logger";
import { DataAccessProvider } from '@mfc/data-access';
import { db } from '@mfc/database';
import { createClient } from '@mfc/supabase-config';
import { useEffect, useState } from 'react';

export function DataAccessProviderWrapper({
    children,
}: {
    children: React.ReactNode;
}): React.ReactElement {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Ensure database is ready
        logger.info({
            hasDb: !!db,
            dbType: db?.constructor?.name,
            tables: db ? Object.keys(db).filter(k => !k.startsWith('_')).slice(0, 10) : [],
        });
        setIsReady(true);
    }, []);

    if (!isReady) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Initializing...</p>
                </div>
            </div>
        );
    }

    return (
        <DataAccessProvider
            supabase={createClient()}
            indexedDB={db}
            defaultCacheTTL={30000}
            enableSync={false}
            enableRealtime={true}
        >
            {children}
        </DataAccessProvider>
    );
}
