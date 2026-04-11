"use client";

import { NotificationPane } from "@/components/NotificationPane";
import { RealtimeNotification } from "@/components/realtime/RealtimeNotification";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { navigationItems } from "@/config/navigation";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import { useAuth } from "@mfc/auth";
import { useRealtimeSync } from "@mfc/realtime-sync/react";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronRight,
  LogOut,
  Palette,
  RefreshCw,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const exploreItems = navigationItems.filter((item) =>
  ["/dashboard", "/quotes"].includes(item.href)
);
const managementItems = navigationItems.filter((item) =>
  ["/approvals", "/users", "/products", "/stock"].includes(item.href)
);

export default function MorePage(): React.JSX.Element {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const { isOnline, lastSyncTime, isSyncing, syncNow } = useRealtimeSync();
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = profile?.display_name || "Manager";
  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      logger.error(error, "Logout error");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleSync = async () => {
    try {
      await syncNow();
    } catch (error) {
      logger.error(error, "Manual sync failed");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-3 py-2 pb-24">
      <div className="space-y-1 px-1">
        <h1 className="text-3xl font-bold text-foreground">More</h1>
        <p className="text-sm text-muted-foreground">
          Account, sync, and the rest of the manager tools.
        </p>
      </div>

      <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
        {loading ? (
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-44 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold text-foreground">{displayName}</div>
              <div className="text-sm capitalize text-muted-foreground">
                {profile?.user_role?.replaceAll("_", " ") ?? "manager"}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {user?.email ?? "Signed in"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {isOnline ? "Online" : "Offline"} • Last sync{" "}
                {lastSyncTime
                  ? formatDistanceToNow(lastSyncTime, { addSuffix: true })
                  : "not available"}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Button
            variant="outline"
            className="h-11 justify-start gap-2 rounded-2xl"
            disabled={!isOnline || isSyncing}
            onClick={handleSync}
          >
            <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
            {isSyncing ? "Syncing..." : "Refresh data"}
          </Button>
          <Link href="/settings" className="block">
            <Button variant="outline" className="h-11 w-full justify-start gap-2 rounded-2xl">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Button
            variant="outline"
            className="h-11 justify-start gap-2 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Logging out..." : "Log out"}
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
            <div>
              <div className="text-sm font-medium text-foreground">System logs</div>
              <div className="text-xs text-muted-foreground">Open notifications</div>
            </div>
            <NotificationPane />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
            <div>
              <div className="text-sm font-medium text-foreground">Live events</div>
              <div className="text-xs text-muted-foreground">Realtime feed</div>
            </div>
            <RealtimeNotification isOnline={isOnline} />
          </div>
        </div>
      </section>

      <MoreSection
        title="Explore"
        description="Core management areas that are fully available on mobile web."
        items={exploreItems}
      />

      <MoreSection
        title="Management"
        description="Extended web tools that still stay reachable from More."
        items={managementItems}
      />

      <section className="space-y-3">
        <div className="px-1">
          <div className="text-sm font-semibold text-foreground">App</div>
          <div className="text-sm text-muted-foreground">
            Theme notes and remaining mobile-web controls.
          </div>
        </div>
        <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
          <div className="flex items-start gap-4 px-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Palette className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground">Theme</div>
              <div className="text-sm text-muted-foreground">
                Balanced light mobile shell is enabled for v1. Theme switching no longer lives in
                the mobile header.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MoreSection({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: typeof navigationItems;
}): React.JSX.Element {
  return (
    <section className="space-y-3">
      <div className="px-1">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={item.href}>
              {index > 0 ? <div className="mx-4 border-t border-border" /> : null}
              <Link
                href={item.href}
                className="flex items-start gap-4 px-4 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">{item.name}</div>
                  {item.description ? (
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  ) : null}
                </div>
                <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
