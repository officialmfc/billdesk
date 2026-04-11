"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Wifi, WifiOff, RefreshCw, Bell } from "lucide-react";
import { useRealtimeSync } from "@mfc/realtime-sync/react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RealtimeEvent {
  id: string;
  table: string;
  eventType: string;
  timestamp: Date;
  recordId?: string;
}

export function RealtimeStatusIndicator(): React.JSX.Element {
  const { isOnline, isSyncing, lastSyncTime } = useRealtimeSync();
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  useEffect(() => {
    const handleRealtimeEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const payload = customEvent.detail;

      console.log("🔔 Realtime event in indicator:", payload);

      // Mark realtime as connected when we receive events
      setRealtimeConnected(true);

      // Add event to list
      const newEvent: RealtimeEvent = {
        id: `${Date.now()}-${Math.random()}`,
        table: payload.table,
        eventType: payload.eventType,
        timestamp: new Date(),
        recordId: payload.recordId,
      };

      setEvents((prev) => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events
      setUnreadCount((prev) => Math.min(prev + 1, 99)); // Cap at 99+
    };

    const handleRealtimeConnected = () => {
      console.log("✅ Realtime connected");
      setRealtimeConnected(true);
    };

    const handleRealtimeDisconnected = () => {
      console.log("❌ Realtime disconnected");
      setRealtimeConnected(false);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mfc:realtime:change", handleRealtimeEvent);
      window.addEventListener(
        "mfc:realtime:connected",
        handleRealtimeConnected
      );
      window.addEventListener(
        "mfc:realtime:disconnected",
        handleRealtimeDisconnected
      );

      return () => {
        window.removeEventListener("mfc:realtime:change", handleRealtimeEvent);
        window.removeEventListener(
          "mfc:realtime:connected",
          handleRealtimeConnected
        );
        window.removeEventListener(
          "mfc:realtime:disconnected",
          handleRealtimeDisconnected
        );
      };
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Mark as read when opened
      setUnreadCount(0);
    }
  };

  const clearEvents = () => {
    setEvents([]);
    setUnreadCount(0);
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "INSERT":
        return "text-green-600 dark:text-green-400";
      case "UPDATE":
        return "text-blue-600 dark:text-blue-400";
      case "DELETE":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "INSERT":
        return "➕";
      case "UPDATE":
        return "✏️";
      case "DELETE":
        return "🗑️";
      default:
        return "📝";
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Realtime Connection Status - Blinking Dot */}
      <div
        className="flex items-center gap-1.5"
        title={
          realtimeConnected ? "Realtime connected" : "Realtime disconnected"
        }
      >
        <span className="relative flex h-2.5 w-2.5">
          {realtimeConnected ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          )}
        </span>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {realtimeConnected ? "Live" : "Disconnected"}
        </span>
      </div>

      {/* Syncing Indicator */}
      {isSyncing && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span className="hidden sm:inline">Syncing...</span>
        </Badge>
      )}

      {/* Realtime Events Bell */}
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative"
            title="Realtime events"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between p-3 border-b">
            <div>
              <h4 className="font-semibold text-sm">Realtime Events</h4>
              <p className="text-xs text-muted-foreground">
                {events.length} event{events.length !== 1 ? "s" : ""}
              </p>
            </div>
            {events.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearEvents}
                className="h-7 text-xs"
              >
                Clear
              </Button>
            )}
          </div>

          <ScrollArea className="h-[300px]">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No events yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Changes will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {getEventIcon(event.eventType)}
                          </span>
                          <span
                            className={`text-sm font-medium ${getEventColor(
                              event.eventType
                            )}`}
                          >
                            {event.eventType}
                          </span>
                        </div>
                        <p className="text-sm font-medium mt-1 truncate">
                          {event.table}
                        </p>
                        {event.recordId && (
                          <p className="text-xs text-muted-foreground truncate">
                            ID: {event.recordId.substring(0, 8)}...
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {lastSyncTime && (
            <div className="p-2 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                Last sync: {lastSyncTime.toLocaleTimeString()}
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
