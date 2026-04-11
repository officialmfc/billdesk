
'use client';

import {
    LogOut,
    Plus,
    RefreshCw,
    Settings,
} from "lucide-react";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from "react";

/**
 * Desktop Portal Layout
 * Optimized for large screens only
 */

import { ProfileDropdown } from "@/components/profile/ProfileDropdown";
import { NewSaleDialog } from "@/components/sales/NewSaleDialog";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { OfflineFormWarning } from "@/components/ui/OfflineFormWarning";
import { desktopNavigationGroups } from "@/config/navigation";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import { useAuth } from "@mfc/auth";
import { useRealtimeSync } from "@mfc/realtime-sync/react";

// Inner component that uses sync context
function DesktopPortalLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [newSaleDialogOpen, setNewSaleDialogOpen] = useState(false);
  const { profile: user, loading: userLoading, signOut } = useAuth();
  const { syncNow, isSyncing } = useRealtimeSync();
  const isOnline = useOnlineStatus();

  const isActive = (href: string, matchPrefixes: string[] = []) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/" || pathname.startsWith("/dashboard/");
    }

    if (pathname === href) {
      return true;
    }

    return matchPrefixes.some((prefix) => {
      if (prefix === "/") {
        return pathname === "/";
      }
      return pathname === prefix || pathname.startsWith(`${prefix}/`);
    });
  };

  const handleSync = async () => {
    try {
      await syncNow();
    } catch (error) {
      logger.error(error, "Manual sync failed");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      logger.error(error, "Logout error");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex h-screen min-h-0 w-64 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        {/* Logo in Sidebar */}
        <div className="border-b border-sidebar-border px-5 py-4">
          <Link href="/dashboard" className="block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/45">
              MFC Manager
            </p>
            <p className="mt-1 text-sm font-semibold text-sidebar-foreground">Manager Desk</p>
          </Link>
        </div>

        {/* New Sale Button */}
        <div className="border-b border-sidebar-border px-4 py-3">
          <Button
            onClick={() => setNewSaleDialogOpen(true)}
            className="h-10 w-full justify-start gap-2 text-sm"
            size="sm"
          >
            <Plus className="h-5 w-5" />
            <span className="font-semibold">New Sale</span>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4">
          {desktopNavigationGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <div className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">
                {group.title}
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, item.matchPrefixes);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="space-y-3 border-t border-sidebar-border p-4">
          {/* User Profile */}
          <div className="space-y-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/45">
              My Account
            </div>
            {userLoading ? (
              <div className="flex items-center space-x-3 px-2">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ) : user ? (
              <>
                <div className="flex items-center space-x-3 px-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                      {user.display_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {user.display_name}
                    </span>
                    <span className="text-xs text-sidebar-foreground/50 capitalize">
                      {user.user_role}
                    </span>
                  </div>
                </div>

                {/* Settings & Logout Buttons */}
                <div className="space-y-1">
                  <Link href="/settings">
                    <Button
                      variant="ghost"
                      className="h-9 w-full justify-start gap-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="h-9 w-full justify-start gap-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 px-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                    ?
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Guest</span>
                  <span className="text-xs text-sidebar-foreground/60">
                    Not logged in
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <header className="flex h-16 items-center justify-end border-b border-border/40 bg-card/50 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              className="gap-2 rounded-full"
              title={isOnline ? "Sync latest data" : "Offline"}
            >
              <RefreshCw className={cn("h-4 w-4", isSyncing ? "animate-spin" : "")} />
              <span>{isOnline ? (isSyncing ? "Syncing..." : "Sync") : "Offline"}</span>
            </Button>
            <ProfileDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex min-h-0 flex-1 overflow-y-auto p-6">
          <OfflineFormWarning isOnline={isOnline} />
          {children}
        </main>
      </div>

      {/* New Sale Dialog */}
      <NewSaleDialog
        open={newSaleDialogOpen}
        onOpenChange={setNewSaleDialogOpen}
      />
    </div>
  );
}

// Export the inner component as the main component
export function DesktopPortalLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <DesktopPortalLayoutInner>{children}</DesktopPortalLayoutInner>;
}
