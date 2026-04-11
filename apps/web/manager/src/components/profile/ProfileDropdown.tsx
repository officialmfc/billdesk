'use client';

/**
 * Profile Dropdown Component
 * Shows user profile with settings and logout
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@mfc/auth";
import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useState } from 'react';

export function ProfileDropdown(): React.JSX.Element | null {
  const { user, profile, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      logger.error(error, "Logout error");
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
  }

  if (!user || !profile) {
    return null;
  }

  // Use display_name from profile (returned by get_current_manager_info)
  const displayName = profile.display_name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.user_metadata?.profile_photo_url}
              alt={displayName}
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={user.user_metadata?.profile_photo_url}
                alt={displayName}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-base">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground truncate max-w-40">
                {user.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground capitalize">
                {profile.user_role}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{loggingOut ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
