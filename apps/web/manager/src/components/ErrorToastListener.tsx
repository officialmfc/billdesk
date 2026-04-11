/**
 * ErrorToastListener Component
 *
 * Listens for app-error custom events and displays toast notifications
 */
'use client';

import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import {
    AlertCircle,
    AlertTriangle,
    Database,
    RefreshCw,
    ShieldAlert,
    WifiOff,
} from 'lucide-react';
import { useEffect } from 'react';

export function ErrorToastListener(): null {
  const { toast } = useToast();

  useEffect(() => {
    const handleAppError = (event: Event) => {
      const customEvent = event as CustomEvent<any>;
      const { message, context, category } = customEvent.detail;

      // Get icon and variant based on error category
      const { variant, title } = getErrorPresentation(category);

      toast({
        variant,
        title,
        description: message,
        action:
          category === 'network' || category === 'sync' ? (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1 text-sm font-medium">
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          ) : undefined,
      });

      // Log to console in development
      if (
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
      ) {
        logger.info({
          message,
          context,
          category,
        });
      }
    };

    window.addEventListener('app-error', handleAppError);

    return () => {
      window.removeEventListener('app-error', handleAppError);
    };
  }, [toast]);

  return null; // This component doesn't render anything
}

/**
 * Get error presentation details based on category
 */
function getErrorPresentation(category?: string): {
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'destructive';
  title: string;
} {
  switch (category) {
    case 'network':
      return {
        icon: WifiOff,
        variant: 'destructive',
        title: 'Network Error',
      };
    case 'database':
      return {
        icon: Database,
        variant: 'destructive',
        title: 'Database Error',
      };
    case 'sync':
      return {
        icon: RefreshCw,
        variant: 'destructive',
        title: 'Sync Error',
      };
    case 'permission':
      return {
        icon: ShieldAlert,
        variant: 'destructive',
        title: 'Permission Denied',
      };
    case 'validation':
      return {
        icon: AlertTriangle,
        variant: 'default',
        title: 'Validation Error',
      };
    default:
      return {
        icon: AlertCircle,
        variant: 'destructive',
        title: 'Error',
      };
  }
}
