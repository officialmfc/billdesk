/**
 * @mfc/auth - Authentication package
 *
 * This package provides authentication state management with
 * offline session support for MFC BillDesk.
 */

// Export React context
export {
    AuthProvider,
    useAuth,
    type AuthContextType,
} from './AuthContext';

// Export session managers
export { SessionManager } from './SessionManager';
export { SecureSessionManager } from './SecureSessionManager';
export { createSingleFlight, type SingleFlightRunner } from './singleFlight';
export { AppSentryBoundary, captureAppException, initializeAppSentry } from "./sentry";

// Export utility functions
export { cacheProfile, loadCachedProfile, validateProfile } from './utils';
