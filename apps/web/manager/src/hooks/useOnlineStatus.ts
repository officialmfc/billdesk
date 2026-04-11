"use client";

import { logger } from "@/lib/logger";
import { useEffect, useState } from "react";

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Set initial status
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            logger.info("🌐 Network: Online");
            setIsOnline(true);
        };

        const handleOffline = () => {
            logger.info("📴 Network: Offline");
            setIsOnline(false);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return isOnline;
}
