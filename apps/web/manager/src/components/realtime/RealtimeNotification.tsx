"use client";

import { useEffect, useState } from "react";
import { Bell, Plus, Pencil, Trash2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RealtimeEvent {
  id: string;
  table: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  timestamp: string;
  recordId?: string;
}

interface RealtimeNotificationProps {
  isOnline?: boolean;
}

export function RealtimeNotification({
  isOnline = true,
}: RealtimeNotificationProps): React.JSX.Element {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleRealtimeEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { table, eventType, recordId } = customEvent.detail;

      const newEvent: RealtimeEvent = {
        id: `${Date.now()}-${Math.random()}`,
        table,
        eventType,
        timestamp: new Date().toISOString(),
        recordId,
      };

      setEvents((prev) => [newEvent, ...prev].slice(0, 50)); // Keep last 50
    };

    const handleConnection = (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsConnected(customEvent.detail?.connected ?? false);
    };

    window.addEventListener("mfc:realtime:change", handleRealtimeEvent);
    window.addEventListener("mfc:realtime:connection", handleConnection);

    // Check initial connection
    setIsConnected(true);

    return () => {
      window.removeEventListener("mfc:realtime:change", handleRealtimeEvent);
      window.removeEventListener("mfc:realtime:connection", handleConnection);
    };
  }, []);

  const handleClear = () => {
    setEvents([]);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
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
    const iconClass = "h-3.5 w-3.5";
    switch (eventType) {
      case "INSERT":
        return <Plus className={iconClass} />;
      case "UPDATE":
        return <Pencil className={iconClass} />;
      case "DELETE":
        return <Trash2 className={iconClass} />;
      default:
        return <Pencil className={iconClass} />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative"
          title={!isOnline ? "Offline mode" : "Realtime events"}
        >
          <Bell className="h-4 w-4" />

          {/* Offline indicator - red dot with wifi off icon */}
          {!isOnline ? (
            <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          ) : (
            /* Online - green dot */
            isConnected && (
              <span className="absolute top-0.5 right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )
          )}

          {/* Event count badge */}
          {events.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {events.length > 99 ? "99+" : events.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Realtime Events</h4>
            {!isOnline ? (
              <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <WifiOff className="w-3 h-3" />
                Offline
              </span>
            ) : (
              isConnected && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Live
                </span>
              )
            )}
          </div>
          {events.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 text-xs"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Events list */}
        <ScrollArea className="h-[400px]">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Bell className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No events yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Changes will appear here in real-time
              </p>
            </div>
          ) : (
            <div>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b bg-muted/50 text-xs font-semibold text-muted-foreground sticky top-0">
                <div className="col-span-1">#</div>
                <div className="col-span-3">Type</div>
                <div className="col-span-5">Table</div>
                <div className="col-span-3 text-right">Time</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y">
                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className="grid grid-cols-12 gap-2 px-3 py-2.5 hover:bg-muted/50 transition-colors text-sm"
                  >
                    {/* Serial Number */}
                    <div className="col-span-1 text-muted-foreground">
                      {index + 1}
                    </div>

                    {/* Type */}
                    <div className="col-span-3 flex items-center gap-1.5">
                      <span className={getEventColor(event.eventType)}>
                        {getEventIcon(event.eventType)}
                      </span>
                      <span
                        className={`text-xs font-medium ${getEventColor(
                          event.eventType
                        )}`}
                      >
                        {event.eventType}
                      </span>
                    </div>

                    {/* Table */}
                    <div className="col-span-5 font-medium truncate">
                      {event.table}
                    </div>

                    {/* Time */}
                    <div className="col-span-3 text-xs text-muted-foreground text-right">
                      {formatTime(event.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
