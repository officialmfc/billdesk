'use client';

import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';
import { useEffect, useState } from 'react';

export default function TestSentryPage() {
    const [mounted, setMounted] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const addLog = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
    };
    const testConsoleLog = () => {
        logger.info('🧪 Test Logger Info');
        addLog('Executed logger.info (Should be ignored in Prod Console, ignored by Sentry)');
    };

    const testConsoleWarn = () => {
        logger.warn('⚠️ Test Logger Warn');
        addLog('Executed logger.warn (Should appear in Prod Console & Sentry)');
    };

    const testConsoleError = () => {
        logger.error('❌ Test Logger Error');
        addLog('Executed logger.error (Should appear in Prod Console & Sentry)');
    };

    const testSentryException = () => {
        try {
            throw new Error('🔥 Test Sentry Exception');
        } catch (error) {
            Sentry.captureException(error);
            addLog('Captured Sentry Exception (Should appear in Sentry)');
        }
    };

    if (!mounted) return null;

    const isProduction = process.env.NODE_ENV === 'production';
    const isSentryEnabled = isProduction || process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Sentry Configuration Test
                    </h1>

                    <div className={`p-4 rounded-lg mb-6 ${isSentryEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        <p className="font-semibold">Current Environment: {process.env.NODE_ENV}</p>
                        <p className="text-sm mt-1">
                            Sentry Capture: {isSentryEnabled ? '✅ ENABLED' : '❌ DISABLED (Dev Mode)'}
                        </p>
                        <p className="text-xs mt-2 break-all font-mono opacity-75">
                            DSN: {process.env.NEXT_PUBLIC_SENTRY_DSN || 'Not Configured'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <button
                            onClick={testConsoleLog}
                            className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors text-left"
                        >
                            1. Test console.log
                            <span className="block text-xs text-gray-500 font-normal mt-1">Should be ignored by Sentry</span>
                        </button>

                        <button
                            onClick={testConsoleWarn}
                            className="px-4 py-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-medium transition-colors text-left"
                        >
                            2. Test console.warn
                            <span className="block text-xs text-yellow-600 font-normal mt-1">Should be captured as Warning</span>
                        </button>

                        <button
                            onClick={testConsoleError}
                            className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors text-left"
                        >
                            3. Test console.error
                            <span className="block text-xs text-red-600 font-normal mt-1">Should be captured as Error</span>
                        </button>

                        <button
                            onClick={testSentryException}
                            className="px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-medium transition-colors text-left"
                        >
                            4. Test Sentry.captureException
                            <span className="block text-xs text-purple-600 font-normal mt-1">Explicit error capture</span>
                        </button>
                    </div>
                </div>

                {logs.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Log</h2>
                        <div className="space-y-2 font-mono text-sm">
                            {logs.map((log, i) => (
                                <div key={i} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-gray-600 dark:text-gray-300 border-l-2 border-blue-500">
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
