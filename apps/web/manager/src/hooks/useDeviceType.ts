'use client';

/**
 * Device Type Detection Hook
 * Detects device type once on mount for bundle optimization
 */

import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'desktop';

export function useDeviceType(): DeviceType {
    // Default to desktop to avoid hydration mismatch
    // Will update to correct value on client mount
    const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

    useEffect(() => {
        // Detect device type once on mount
        const detectDevice = (): DeviceType => {
            if (typeof window === 'undefined') return 'desktop';

            // Use 768px as breakpoint (same as Tailwind md:)
            const isMobile = window.innerWidth < 768;
            return isMobile ? 'mobile' : 'desktop';
        };

        setDeviceType(detectDevice());

        // Optional: Listen for resize to handle orientation changes
        const handleResize = () => {
            setDeviceType(detectDevice());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return deviceType;
}

/**
 * Server-side device detection (for SSR)
 * Uses user agent as fallback
 */
export function getServerDeviceType(userAgent?: string): DeviceType {
    if (!userAgent) return 'desktop';

    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent) ? 'mobile' : 'desktop';
}
