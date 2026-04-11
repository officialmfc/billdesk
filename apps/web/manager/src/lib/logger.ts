import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';
const isSentryEnabled = !isDev || process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true';

let logger: pino.Logger;

if (typeof window === 'undefined') {
    // Server-side configuration
    const targets: any[] = [];

    if (isDev) {
        // Development: Pretty print to console
        targets.push({
            target: 'pino-pretty',
            options: {
                colorize: true,
                ignore: 'pid,hostname',
                translateTime: 'SYS:standard',
            },
            level: 'debug',
        });
    } else {
        // Production: JSON logs (standard for server)
        // We can add a file transport or stdout here if needed
        // For now, we just want to ensure we don't use pino-pretty in prod unless debugging
    }

    if (isSentryEnabled && process.env.NEXT_PUBLIC_SENTRY_DSN) {
        targets.push({
            target: 'pino-sentry-transport',
            options: {
                sentry: {
                    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
                    environment: process.env.NODE_ENV,
                },
                minLevel: 40, // Warn level (40) and above
            },
            level: 'warn',
        });
    }

    // If no targets (e.g. prod without sentry), fallback to basic stdout
    const transport = targets.length > 0 ? pino.transport({ targets }) : undefined;

    logger = pino({
        level: isDev ? 'debug' : 'info',
        base: undefined, // Remove pid and hostname
        timestamp: pino.stdTimeFunctions.isoTime,
    }, transport);

} else {
    // Client-side configuration
    logger = pino({
        level: isDev ? 'debug' : 'info',
        browser: {
            asObject: true,
            write: (o: any) => {
                const { level, msg, ...rest } = o;

                // Dispatch to LogStore (client-side only)
                // This handles "info log like data fetching etc will in system log" for both Dev and Prod
                if (typeof window !== 'undefined') {
                    import('@/lib/log-store').then(({ useLogStore }) => {
                        const levelName = level >= 50 ? 'error' : level >= 40 ? 'warn' : 'info';
                        // Only show info/warn/error in the pane
                        if (level >= 30) {
                             useLogStore.getState().addLog({
                                message: msg || 'No message',
                                data: Object.keys(rest).length > 0 ? rest : undefined,
                                level: levelName,
                            });
                        }
                    });
                }

                // Console Output Logic
                if (isDev) {
                    // Development:
                    // "critical log will show in console" -> Warn (40) and Error (50)
                    // "info log ... will in system log" -> Suppress Info (30) from console
                    if (level >= 40) {
                        const method = level >= 50 ? 'error' : 'warn';
                        msg ? console[method](msg, rest) : console[method](rest);
                    }
                    // Debug (20) still goes to console if needed, or suppress?
                    // Usually debug is for console. Let's keep debug in console if explicit,
                    // but the user asked to make console better.
                    // If level is 20 (debug), let's allow it in console for dev debugging,
                    // but suppress 30 (info) which is now "system log" territory.
                    else if (level === 20) {
                         msg ? console.debug(msg, rest) : console.debug(rest);
                    }
                } else {
                    // Production:
                    // "critical issues will in senitery.io"
                    // We typically still want errors in console for debugging if Sentry fails or for local repro
                    if (level >= 50) {
                        msg ? console.error(msg, rest) : console.error(rest);
                    }
                }

                // Sentry Logic (Production only)
                // "critical issues will in senitery.io"
                if (isSentryEnabled && level >= 50) {
                    import('@sentry/nextjs').then((Sentry) => {
                        Sentry.withScope((scope) => {
                            scope.setExtras(rest);
                             const error = rest.err || rest.error || new Error(msg);
                             Sentry.captureException(error);
                        });
                    });
                }
            }
        }
    });
}

export { logger };
