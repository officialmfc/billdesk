'use client';

import { logger } from "@/lib/logger";
import { useEffect } from "react";

/**
 * LogRocket Provider
 * Initializes LogRocket and identifies users in production
 * Disabled in development to avoid HMR issues
 */
export function LogRocketProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  useEffect(() => {
    // Only initialize in production
    if (
      typeof window !== "undefined" &&
      window.location.hostname !== "localhost"
    ) {
      // Dynamically import LogRocket only in production
      import("@/lib/logrocket")
        .then(({ initLogRocket, identifyUser }) => {
          initLogRocket();

          // Identify user if authenticated
          const identifyCurrentUser = async () => {
            try {
              const { createClient } = await import("@mfc/supabase-config");
              const supabase = createClient();
              const {
                data: { user },
              } = await supabase.auth.getUser();

              if (user) {
                // Get user profile using RPC function
                const { data: profile } = await supabase
                  .rpc("get_current_manager_info")
                  .single();

                const info = profile as { display_name?: string; user_role?: string };
                identifyUser(user.id, {
                  email: user.email || "unknown",
                  name: info?.display_name || "Unknown",
                  role: info?.user_role || "unknown",
                });
              }
            } catch (error) {
              logger.error(error, "[LogRocket] Failed to identify user");
            }
          };

          identifyCurrentUser();
        })
        .catch((error) => {
          logger.error(error, "[LogRocket] Failed to load");
        });
    }
  }, []);

  return <>{children}</>;
}
