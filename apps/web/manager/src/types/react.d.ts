/**
 * React 19 Type Compatibility Fix
 * 
 * This file resolves type incompatibilities between React 19 and Next.js 16
 * by extending the React namespace to accept both React 18 and React 19 types.
 */

import 'react';

declare module 'react' {
    // Make ReactNode compatible with both React 18 and 19
    type ReactNode = React.ReactNode | import('react').ReactElement | null | undefined;
}
